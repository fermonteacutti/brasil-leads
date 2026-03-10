import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// CNAE codes mapped to business types used in the wizard
const CNAE_MAP: Record<string, string[]> = {
  "Restaurantes": ["5611201", "5611202", "5611203"],
  "Lojas/Varejo": ["4711301", "4711302", "4712100"],
  "Serviços": ["8211300", "8219901", "8299799"],
  "Saúde": ["8610101", "8630501", "8630503", "8650001"],
  "Educação": ["8511200", "8512100", "8513900", "8520100"],
  "Escritórios": ["6911701", "6920601", "6920602", "6399200"],
  "Indústria": ["1091101", "1099699", "2599399"],
  "Outros": [],
};

// Source mapping: UI source → internal sub-sources
const SOURCE_MAP: Record<string, string[]> = {
  redes_sociais: ["google_maps", "instagram", "facebook"],
  cnpj: ["cnpj"],
  // Legacy direct values
  google_maps: ["google_maps"],
  instagram: ["instagram"],
  facebook: ["facebook"],
};

interface SearchPayload {
  search_id: string;
}

interface LeadInsert {
  user_id: string;
  search_id: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  source: string;
  segment: string;
  raw_data: unknown;
  funnel_status: string;
  verification_status: string;
}

// ── Google Maps source ──────────────────────────────────────────────
async function searchGoogleMaps(
  search: any,
  userId: string,
  searchId: string
): Promise<LeadInsert[]> {
  const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("GOOGLE_PLACES_API_KEY is not configured – skipping Google Maps source");
    return [];
  }

  let textQuery = search.business_type;
  if (!search.nationwide) {
    if (search.location_city) textQuery += ` em ${search.location_city}`;
    if (search.location_state) textQuery += `, ${search.location_state}`;
  } else {
    textQuery += " no Brasil";
  }

  const placesBody: Record<string, unknown> = {
    textQuery,
    languageCode: "pt-BR",
    maxResultCount: 20,
  };

  if (!search.nationwide && search.location_state) {
    placesBody.regionCode = "BR";
  }

  const placesResponse = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.types,places.shortFormattedAddress",
      },
      body: JSON.stringify(placesBody),
    }
  );

  if (!placesResponse.ok) {
    const errBody = await placesResponse.text();
    console.error(`Google Places API error [${placesResponse.status}]: ${errBody}`);
    return [];
  }

  const placesData = await placesResponse.json();
  const places = placesData.places || [];

  return places.map((place: any) => {
    // Brazilian addresses: "Rua X, 123 - Bairro, Cidade - UF, CEP, Brasil"
    const addr = place.formattedAddress || "";
    let city: string | null = null;
    let state: string | null = null;

    // Find the "Cidade - UF" segment (second-to-last or third-to-last comma part)
    const parts = addr.split(",").map((s: string) => s.trim());
    for (const part of parts) {
      const match = part.match(/^(.+?)\s*-\s*([A-Z]{2})$/);
      if (match) {
        city = match[1].trim();
        state = match[2].trim();
        break;
      }
    }

    return {
      user_id: userId,
      search_id: searchId,
      company_name: place.displayName?.text || null,
      address: place.formattedAddress || null,
      phone:
        place.nationalPhoneNumber ||
        place.internationalPhoneNumber ||
        null,
      website: place.websiteUri || null,
      email: null,
      cnpj: null,
      city,
      state,
      source: "google_maps",
      segment: search.business_type,
      raw_data: place,
      funnel_status: "new",
      verification_status: "pending",
    };
  });
}

// ── CNPJ source with fallback APIs ──────────────────────────────────
async function searchCNPJ(
  search: any,
  userId: string,
  searchId: string
): Promise<LeadInsert[]> {
  // Try APIs in order: OpenCNPJ → CNPJ.ws
  let leads = await searchCNPJ_OpenCNPJ(search, userId, searchId);
  if (leads.length > 0) return leads;

  console.log("OpenCNPJ returned 0 results, trying CNPJ.ws...");
  leads = await searchCNPJ_CnpjWs(search, userId, searchId);
  return leads;
}

// ── OpenCNPJ.org ────────────────────────────────────────────────────
async function searchCNPJ_OpenCNPJ(
  search: any,
  userId: string,
  searchId: string
): Promise<LeadInsert[]> {
  try {
    const cnaeCodes = CNAE_MAP[search.business_type] || [];
    const params = new URLSearchParams();

    if (cnaeCodes.length > 0) {
      params.set("cnae", cnaeCodes[0]);
    }
    if (!search.nationwide && search.location_state) {
      params.set("uf", search.location_state);
    }
    if (search.location_city) {
      params.set("municipio", search.location_city.toUpperCase());
    }
    params.set("situacao", "ATIVA");
    params.set("limit", "20");

    const url = `https://api.opencnpj.org/v1/empresas?${params.toString()}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenCNPJ API error [${response.status}]: ${errText}`);
      return [];
    }

    const data = await response.json();
    const companies = Array.isArray(data) ? data : data.data || data.results || [];
    console.log(`OpenCNPJ returned ${companies.length} results`);

    return companies.map((c: any) => mapCnpjCompanyToLead(c, userId, searchId, search.business_type));
  } catch (err) {
    console.error("OpenCNPJ fetch error:", err);
    return [];
  }
}

// ── CNPJ.ws ─────────────────────────────────────────────────────────
async function searchCNPJ_CnpjWs(
  search: any,
  userId: string,
  searchId: string
): Promise<LeadInsert[]> {
  try {
    const cnaeCodes = CNAE_MAP[search.business_type] || [];
    const params = new URLSearchParams();

    if (cnaeCodes.length > 0) {
      params.set("atividade_principal", cnaeCodes.join(","));
    }
    if (!search.nationwide && search.location_state) {
      params.set("uf", search.location_state);
    }
    if (search.location_city) {
      params.set("municipio", search.location_city.toUpperCase());
    }
    params.set("situacao_cadastral", "ATIVA");
    params.set("limit", "20");

    const url = `https://publica.cnpj.ws/cnpj/search?${params.toString()}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`CNPJ.ws API error [${response.status}]: ${errText}`);
      return [];
    }

    const data = await response.json();
    const companies = Array.isArray(data) ? data : data.data || data.results || [];
    console.log(`CNPJ.ws returned ${companies.length} results`);

    return companies.map((c: any) => mapCnpjCompanyToLead(c, userId, searchId, search.business_type));
  } catch (err) {
    console.error("CNPJ.ws fetch error:", err);
    return [];
  }
}

// ── Shared CNPJ data mapper ────────────────────────────────────────
function mapCnpjCompanyToLead(
  c: any,
  userId: string,
  searchId: string,
  businessType: string
): LeadInsert {
  const cnpjFormatted = c.cnpj || null;
  const razaoSocial = c.razao_social || c.nome_fantasia || null;
  const nomeFantasia = c.nome_fantasia || c.razao_social || null;

  const addressParts = [
    c.logradouro,
    c.numero,
    c.complemento,
    c.bairro,
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : null;

  let phone = null;
  if (c.ddd_telefone_1) {
    phone = c.ddd_telefone_1;
  } else if (c.telefone) {
    phone = c.telefone;
  }

  return {
    user_id: userId,
    search_id: searchId,
    company_name: nomeFantasia || razaoSocial,
    address,
    phone,
    website: null,
    email: c.email || c.email_responsavel || null,
    cnpj: cnpjFormatted,
    city: c.municipio || c.cidade || null,
    state: c.uf || c.estado || null,
    source: "cnpj",
    segment: businessType,
    raw_data: c,
    funnel_status: "new",
    verification_status: "pending",
  };
}

// ── Expand UI sources to internal sub-sources ───────────────────────
function expandSources(sources: string[]): Set<string> {
  const expanded = new Set<string>();
  for (const s of sources) {
    const mapped = SOURCE_MAP[s] || [s];
    for (const sub of mapped) expanded.add(sub);
  }
  return expanded;
}

// ── Main handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { search_id } = (await req.json()) as SearchPayload;

    const { data: search, error: searchError } = await supabase
      .from("searches")
      .select("*")
      .eq("id", search_id)
      .eq("user_id", user.id)
      .single();

    if (searchError || !search) {
      return new Response(JSON.stringify({ error: "Search not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("searches")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", search_id);

    const uiSources: string[] = search.sources || [];
    const internalSources = expandSources(uiSources);
    console.log(`Processing search ${search_id} with sources: ${[...internalSources].join(", ")}`);

    const sourcePromises: Promise<LeadInsert[]>[] = [];

    if (internalSources.has("google_maps")) {
      sourcePromises.push(searchGoogleMaps(search, user.id, search_id));
    }
    if (internalSources.has("cnpj")) {
      sourcePromises.push(searchCNPJ(search, user.id, search_id));
    }
    // Future: instagram, facebook handlers

    const results = await Promise.allSettled(sourcePromises);
    const allLeads: LeadInsert[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        allLeads.push(...result.value);
      } else {
        console.error("Source error:", result.reason);
      }
    }

    console.log(`Total leads collected: ${allLeads.length}`);

    let leadsInserted = 0;
    if (allLeads.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("leads")
        .insert(allLeads)
        .select("id");

      if (insertError) {
        console.error("Error inserting leads:", insertError);
      } else {
        leadsInserted = inserted?.length || 0;
      }
    }

    // Credit multiplier: both sources selected = 1.5x per lead
    const bothSources = uiSources.includes("redes_sociais") && uiSources.includes("cnpj");
    const creditsUsed = bothSources ? Math.ceil(leadsInserted * 1.5) : leadsInserted;

    await supabase
      .from("searches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        leads_found: leadsInserted,
        credits_used: creditsUsed,
      })
      .eq("id", search_id);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: leadsInserted,
        credits_used: creditsUsed,
        search_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Edge function error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
