// ============================================================
// BuscaLead — Edge Function: search-leads
// Versão com controle de créditos + paginação + redes sociais
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Autenticação ──────────────────────────────────────────
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Token de autenticação ausente', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Usuário não autenticado', 401)
    }

    // ── Parâmetros da busca ───────────────────────────────────
    const { keyword, city, state, maxResults = 100 } = await req.json()

    if (!keyword || !city || !state) {
      return errorResponse('Parâmetros obrigatórios: keyword, city, state', 400)
    }

    // ── Verificar saldo ANTES de buscar ───────────────────────
    const { data: creditData, error: creditError } = await supabaseClient
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (creditError || !creditData) {
      return errorResponse('Erro ao verificar créditos', 400)
    }

    if (creditData.balance < 1) {
      return new Response(
        JSON.stringify({
          error: 'Créditos insuficientes',
          code: 'INSUFFICIENT_CREDITS',
          balance: creditData.balance,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // ── Busca no Google Places ────────────────────────────────
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      return errorResponse('Google Places API Key não configurada', 500)
    }

    const leads: Lead[] = []
    const query = `${keyword} em ${city} ${state}`
    const maxPages = 5
    let pageToken: string | null = null

    for (let page = 0; page < maxPages; page++) {
      const body: Record<string, unknown> = {
        textQuery: query,
        maxResultCount: 20,
        languageCode: 'pt-BR',
        locationBias: {
          circle: {
            center: await getCityCoordinates(city, state, googleApiKey),
            radius: 50000.0,
          },
        },
      }

      if (pageToken) {
        body.pageToken = pageToken
      }

      const placesRes = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': [
              'places.id',
              'places.displayName',
              'places.formattedAddress',
              'places.nationalPhoneNumber',
              'places.websiteUri',
              'places.businessStatus',
              'nextPageToken',
            ].join(','),
          },
          body: JSON.stringify(body),
        }
      )

      if (!placesRes.ok) {
        console.error('Google Places error:', await placesRes.text())
        break
      }

      const placesData = await placesRes.json()
      const places = placesData.places ?? []

      if (places.length === 0) break

      // Enriquecer com CNPJ e redes sociais em paralelo
      const enriched = await Promise.all(
        places.map((place: GooglePlace) => enrichPlace(place))
      )

      leads.push(...enriched.filter(Boolean) as Lead[])
      pageToken = placesData.nextPageToken ?? null

      if (!pageToken || leads.length >= maxResults) break

      // Delay entre páginas para evitar rate limit
      if (page < maxPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    if (leads.length === 0) {
      return new Response(
        JSON.stringify({ leads: [], total: 0, creditsUsed: 0, balance: creditData.balance }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Debitar créditos via função atômica ───────────────────
    const { data: debitResult, error: debitError } = await supabaseClient
      .rpc('debit_credits', {
        p_user_id: user.id,
        p_amount: leads.length,
        p_description: `Busca: ${keyword} em ${city}/${state} — ${leads.length} leads`,
        p_reference_id: null,
      })

    if (debitError || !debitResult?.success) {
      console.error('Erro ao debitar créditos:', debitError ?? debitResult)

      // Se falhou por saldo insuficiente (race condition)
      if (debitResult?.error === 'insufficient_credits') {
        return new Response(
          JSON.stringify({
            error: 'Créditos insuficientes para cobrir os leads encontrados',
            code: 'INSUFFICIENT_CREDITS',
            balance: debitResult.balance,
            required: debitResult.required,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return errorResponse('Erro ao processar créditos. Busca cancelada.', 500)
    }

    // ── Salvar leads no banco ─────────────────────────────────
    const leadsToInsert = leads.map(lead => ({
      user_id: user.id,
      company_name: lead.company_name,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      cnpj: lead.cnpj,
      address: lead.address,
      city: city,
      state: state,
      instagram_url: lead.instagram_url,
      facebook_url: lead.facebook_url,
      linkedin_url: lead.linkedin_url,
      funnel_status: 'new',
      raw_data: lead.raw_data,
    }))

    const { error: insertError } = await supabaseClient
      .from('leads')
      .insert(leadsToInsert)

    if (insertError) {
      console.error('Erro ao salvar leads:', insertError)
      // Não bloqueia — créditos já foram debitados, loga e segue
    }

    // ── Resposta final ────────────────────────────────────────
    return new Response(
      JSON.stringify({
        leads,
        total: leads.length,
        creditsUsed: leads.length,
        balanceBefore: debitResult.balance_before,
        balanceAfter: debitResult.balance_after,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Erro inesperado:', err)
    return errorResponse('Erro interno do servidor', 500)
  }
})

// ── Helpers ──────────────────────────────────────────────────

function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getCityCoordinates(city: string, state: string, apiKey: string) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${city}, ${state}, Brasil`)}&key=${apiKey}`
    )
    const data = await res.json()
    if (data.results?.[0]?.geometry?.location) {
      return data.results[0].geometry.location
    }
  } catch (_) { /* fallback para São Paulo */ }
  return { lat: -23.5505, lng: -46.6333 }
}

async function enrichPlace(place: GooglePlace): Promise<Lead | null> {
  try {
    const lead: Lead = {
      company_name: place.displayName?.text ?? '',
      phone: place.nationalPhoneNumber ?? null,
      email: null,
      website: place.websiteUri ?? null,
      cnpj: null,
      address: place.formattedAddress ?? null,
      instagram_url: null,
      facebook_url: null,
      linkedin_url: null,
      raw_data: place,
    }

    // Enriquecer em paralelo: CNPJ + redes sociais
    const [cnpjData, socialData] = await Promise.all([
      lead.company_name ? fetchCNPJ(lead.company_name) : null,
      lead.website ? fetchSocialLinks(lead.website) : null,
    ])

    if (cnpjData) {
      lead.cnpj = cnpjData.cnpj ?? null
      lead.email = lead.email ?? cnpjData.email ?? null
      lead.phone = lead.phone ?? cnpjData.phone ?? null
    }

    if (socialData) {
      lead.instagram_url = socialData.instagram ?? null
      lead.facebook_url = socialData.facebook ?? null
      lead.linkedin_url = socialData.linkedin ?? null
      lead.email = lead.email ?? socialData.email ?? null
    }

    return lead
  } catch (_) {
    return null
  }
}

async function fetchCNPJ(companyName: string): Promise<Partial<Lead> | null> {
  try {
    // OpenCNPJ como primário
    const res = await fetch(
      `https://api.opencnpj.com.br/consulta?razao=${encodeURIComponent(companyName)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error('OpenCNPJ falhou')
    const data = await res.json()
    const first = Array.isArray(data) ? data[0] : data
    return {
      cnpj: first?.cnpj ?? null,
      email: first?.email ?? null,
      phone: first?.ddd_telefone_1 ? `(${first.ddd_telefone_1}) ${first.telefone_1}` : null,
    }
  } catch (_) {
    try {
      // Fallback: CNPJ.ws
      const res = await fetch(
        `https://publica.cnpj.ws/cnpj/search?q=${encodeURIComponent(companyName)}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) return null
      const data = await res.json()
      const first = data?.data?.[0]
      return {
        cnpj: first?.cnpj ?? null,
        email: first?.estabelecimento?.email ?? null,
      }
    } catch (_) {
      return null
    }
  }
}

async function fetchSocialLinks(websiteUrl: string): Promise<SocialLinks | null> {
  try {
    const res = await fetch(websiteUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BuscaLead/1.0)' },
    })
    if (!res.ok) return null
    const html = await res.text()

    return {
      instagram: extractLink(html, /instagram\.com\/([^"'\s\/]+)/i, 'https://instagram.com/'),
      facebook: extractLink(html, /facebook\.com\/([^"'\s\/]+)/i, 'https://facebook.com/'),
      linkedin: extractLink(html, /linkedin\.com\/(company|in)\/([^"'\s\/]+)/i, 'https://linkedin.com/company/'),
      email: extractEmail(html),
    }
  } catch (_) {
    return null
  }
}

function extractLink(html: string, regex: RegExp, baseUrl: string): string | null {
  const match = html.match(regex)
  if (!match) return null
  const handle = match[match.length - 1].replace(/[?#].*$/, '')
  if (['sharer', 'share', 'plugins', 'login', 'dialog'].includes(handle)) return null
  return `${baseUrl}${handle}`
}

function extractEmail(html: string): string | null {
  const match = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i)
  return match ? match[1] : null
}

// ── Tipos ─────────────────────────────────────────────────────

interface GooglePlace {
  id?: string
  displayName?: { text: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  websiteUri?: string
  businessStatus?: string
}

interface Lead {
  company_name: string
  phone: string | null
  email: string | null
  website: string | null
  cnpj: string | null
  address: string | null
  instagram_url: string | null
  facebook_url: string | null
  linkedin_url: string | null
  raw_data: unknown
}

interface SocialLinks {
  instagram: string | null
  facebook: string | null
  linkedin: string | null
  email: string | null
}
