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
    const addressParts = (place.formattedAddress || "")
      .split(",")
      .map((s: string) => s.trim());
    const city =
      addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null;
    const state =
      addressParts.length >= 2 ? addressParts[addressParts.length - 2] : null;

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

// ── Base CNPJ source (Casa dos Dados public API) ────────────────────
async function searchCNPJ(
  search: any,
  userId: string,
  searchId: string
): Promise<LeadInsert[]> {
  const cnaeCodes = CNAE_MAP[search.business_type] || [];

  // If we have no CNAE codes and a custom business type, try a term search
  const termo = cnaeCodes.length === 0 ? [search.business_type] : [];

  const body: Record<string, unknown> = {
    query: {
      termo,
      atividade_principal: cnaeCodes,
      natureza_juridica: [],
      uf: search.nationwide ? [] : search.location_state ? [search.location_state] : [],
      municipio: search.location_city
        ? [search.location_city.toUpperCase()]
        : [],
      situacao_cadastral: "ATIVA",
    },
    range_query: {},
    extras: {
      somente_mei: false,
      excluir_mei: false,
      com_email: false,
      incluir_atividade_secundaria: false,
      com_contato_telefonico: false,
      somente_fixo: false,
      somente_celular: false,
      somente_matriz: false,
      somente_filial: false,
    },
    page: 1,
  };

  console.log("CNPJ search body:", JSON.stringify(body));

  const response = await fetch(
    "https://api.casadosdados.com.br/v2/public/cnpj/search",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Casa dos Dados API error [${response.status}]: ${errText}`);
    return [];
  }

  const data = await response.json();
  const companies = data.data?.cnpj || [];

  console.log(`CNPJ source returned ${companies.length} results`);

  return companies.map((c: any) => {
    const cnpjFormatted = c.cnpj || null;
    const razaoSocial = c.razao_social || c.nome_fantasia || null;
    const nomeFantasia = c.nome_fantasia || c.razao_social || null;

    // Build address
    const addressParts = [
      c.logradouro,
      c.numero,
      c.complemento,
      c.bairro,
    ].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(", ") : null;

    // Build phone from DDD + telefone
    let phone = null;
    if (c.ddd_telefone_1) {
      phone = c.ddd_telefone_1;
    }

    return {
      user_id: userId,
      search_id: searchId,
      company_name: nomeFantasia || razaoSocial,
      address,
      phone,
      website: null,
      email: c.email || null,
      cnpj: cnpjFormatted,
      city: c.municipio || null,
      state: c.uf || null,
      source: "cnpj",
      segment: search.business_type,
      raw_data: c,
      funnel_status: "new",
      verification_status: "pending",
    };
  });
}

// ── Main handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { search_id } = (await req.json()) as SearchPayload;

    // Get search record
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

    // Update status to running
    await supabase
      .from("searches")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", search_id);

    const sources: string[] = search.sources || [];
    console.log(`Processing search ${search_id} with sources: ${sources.join(", ")}`);

    // Collect leads from all selected sources in parallel
    const sourcePromises: Promise<LeadInsert[]>[] = [];

    if (sources.includes("google_maps")) {
      sourcePromises.push(searchGoogleMaps(search, user.id, search_id));
    }
    if (sources.includes("cnpj")) {
      sourcePromises.push(searchCNPJ(search, user.id, search_id));
    }

    // Future sources would be added here:
    // if (sources.includes("instagram")) { ... }
    // if (sources.includes("facebook")) { ... }
    // if (sources.includes("linkedin")) { ... }
    // if (sources.includes("websites")) { ... }

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

    // Insert all leads
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

    // Update search as completed
    await supabase
      .from("searches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        leads_found: leadsInserted,
        credits_used: leadsInserted,
      })
      .eq("id", search_id);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: leadsInserted,
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
