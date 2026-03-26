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
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  source: string;
  segment: string;
  raw_data: unknown;
  funnel_status: string;
  verification_status: string;
}

// Max pages to fetch from Google Places (each page = up to 20 results)
const MAX_PAGES = 5; // = up to 100 leads per search

// ── Extract social media links from a website ───────────────────────
async function extractSocialLinks(websiteUrl: string): Promise<{
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
}> {
  const result = { instagram: null as string | null, facebook: null as string | null, linkedin: null as string | null };
  if (!websiteUrl) return result;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BuscaLead/1.0)" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!response.ok) return result;

    const html = await response.text();

    const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?/);
    if (igMatch) result.instagram = igMatch[0];

    const fbMatch = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?/);
    if (fbMatch) result.facebook = fbMatch[0];

    const liMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9_-]+\/?/);
    if (liMatch) result.linkedin = liMatch[0];
  } catch {
    // Timeout or fetch error — skip silently
  }

  return result;
}

// ── Parse city/state from Brazilian address ─────────────────────────
function parseCityState(formattedAddress: string): { city: string | null; state: string | null } {
  let city: string | null = null;
  let state: string | null = null;

  const parts = formattedAddress.split(",").map((s: string) => s.trim());
  for (const part of parts) {
    const match = part.match(/^(.+?)\s*-\s*([A-Z]{2})$/);
    if (match) {
      city = match[1].trim();
      state = match[2].trim();
      break;
    }
  }

  return { city, state };
}

// ── Google Maps source (with pagination) ────────────────────────────
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

  const FIELD_MASK = [
    "places.displayName",
    "places.formattedAddress",
    "places.shortFormattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.businessStatus",
    "places.types",
    "places.rating",
    "places.userRatingCount",
    "nextPageToken",
  ].join(",");

  const allPlaces: any[] = [];
  let pageToken: string | undefined = undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const placesBody: Record<string, unknown> = {
      textQuery,
      languageCode: "pt-BR",
      maxResultCount: 20,
    };

    if (!search.nationwide && search.location_state) {
      placesBody.regionCode = "BR";
    }

    if (pageToken) {
      placesBody.pageToken = pageToken;
    }

    const placesResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(placesBody),
      }
    );

    if (!placesResponse.ok) {
      const errBody = await placesResponse.text();
      console.error(`Google Places API error [${placesResponse.status}]: ${errBody}`);
      break;
    }

    const placesData = await placesResponse.json();
    const places = placesData.places || [];
    allPlaces.push(...places);

    console.log(`Google Places page ${page + 1}: ${places.length} results (total: ${allPlaces.length})`);

    // Check if there's a next page
    if (placesData.nextPageToken) {
      pageToken = placesData.nextPageToken;
    } else {
      break; // No more pages
    }
  }

  console.log(`Google Places total: ${allPlaces.length} places found`);

  // Extract social links from websites (parallel, with concurrency limit)
  const CONCURRENCY = 5;
  const socialResults: Map<number, Awaited<ReturnType<typeof extractSocialLinks>>> = new Map();

  for (let i = 0; i < allPlaces.length; i += CONCURRENCY) {
    const batch = allPlaces.slice(i, i + CONCURRENCY);
    const promises = batch.map((place, idx) =>
      extractSocialLinks(place.websiteUri || "").then((links) => {
        socialResults.set(i + idx, links);
      })
    );
    await Promise.allSettled(promises);
  }

  return allPlaces.map((place: any, idx: number) => {
    const { city, state } = parseCityState(place.formattedAddress || "");
    const social = socialResults.get(idx) || { instagram: null, facebook: null, linkedin: null };

    return {
      user_id: userId,
      search_id: searchId,
      company_name: place.displayName?.text || null,
      address: place.formattedAddress || null,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
      website: place.websiteUri || null,
      email: null,
      cnpj: null,
      city,
      state,
      linkedin_url: social.linkedin,
      instagram_url: social.instagram,
      facebook_url: social.facebook,
      source: "google_maps",
      segment: search.business_type,
      raw_data: { ...place, rating: place.rating || null, userRatingCount: place.userRatingCount || null },
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
    linkedin_url: null,
    instagram_url: null,
    facebook_url: null,
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

    // ── Deduplication ──────────────────────────────────────────────────
    // 1. Dedupe within batch (same company_name + city)
    const seen = new Set<string>();
    const uniqueLeads = allLeads.filter((l) => {
      const key = `${(l.company_name || "").toLowerCase().trim()}|${(l.city || "").toLowerCase().trim()}|${(l.phone || "").trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Total leads collected: ${allLeads.length}, after dedup: ${uniqueLeads.length}`);

    // 2. Dedupe against existing leads in DB for this user
    let leadsToInsert = uniqueLeads;
    if (uniqueLeads.length > 0) {
      const { data: existing } = await supabase
        .from("leads")
        .select("company_name, city, phone")
        .eq("user_id", user.id);

      if (existing && existing.length > 0) {
        const existingKeys = new Set(
          existing.map(
            (e: any) =>
              `${(e.company_name || "").toLowerCase().trim()}|${(e.city || "").toLowerCase().trim()}|${(e.phone || "").trim()}`
          )
        );
        leadsToInsert = uniqueLeads.filter((l) => {
          const key = `${(l.company_name || "").toLowerCase().trim()}|${(l.city || "").toLowerCase().trim()}|${(l.phone || "").trim()}`;
          return !existingKeys.has(key);
        });
      }
      console.log(`After DB dedup: ${leadsToInsert.length} new leads to insert`);
    }

    let leadsInserted = 0;
    if (leadsToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("leads")
        .insert(leadsToInsert)
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
