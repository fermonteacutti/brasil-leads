import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchPayload {
  search_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured");
    }

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
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
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

    // Build Google Places text query
    let textQuery = search.business_type;
    if (!search.nationwide) {
      if (search.location_city) textQuery += ` em ${search.location_city}`;
      if (search.location_state) textQuery += `, ${search.location_state}`;
    } else {
      textQuery += " no Brasil";
    }

    // Call Google Places API (New) - Text Search
    const placesUrl = "https://places.googleapis.com/v1/places:searchText";
    const placesBody: Record<string, unknown> = {
      textQuery,
      languageCode: "pt-BR",
      maxResultCount: 20,
    };

    // If location is specified and not nationwide, add location bias
    if (!search.nationwide && search.location_state) {
      placesBody.regionCode = "BR";
    }

    const placesResponse = await fetch(placesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.types,places.shortFormattedAddress",
      },
      body: JSON.stringify(placesBody),
    });

    if (!placesResponse.ok) {
      const errBody = await placesResponse.text();
      console.error(`Google Places API error [${placesResponse.status}]: ${errBody}`);
      await supabase
        .from("searches")
        .update({
          status: "failed",
          error_message: `Google Places API error: ${placesResponse.status}`,
        })
        .eq("id", search_id);
      return new Response(
        JSON.stringify({ error: `Google Places API error: ${placesResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const placesData = await placesResponse.json();
    const places = placesData.places || [];

    // Parse and insert leads
    const leads = places.map((place: any) => {
      // Extract city/state from formatted address
      const addressParts = (place.formattedAddress || "").split(",").map((s: string) => s.trim());
      const city = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null;
      const state = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : null;

      return {
        user_id: user.id,
        search_id: search_id,
        company_name: place.displayName?.text || null,
        address: place.formattedAddress || null,
        phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
        website: place.websiteUri || null,
        city,
        state,
        source: "google_maps",
        segment: search.business_type,
        raw_data: place,
        funnel_status: "new",
        verification_status: "pending",
      };
    });

    let leadsInserted = 0;
    if (leads.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("leads")
        .insert(leads)
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
