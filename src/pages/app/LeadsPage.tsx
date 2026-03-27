import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/components/leads/lead-types";
import LeadsFilterSidebar, { LeadFilters, DEFAULT_FILTERS } from "@/components/leads/LeadsFilterSidebar";
import LeadsTable from "@/components/leads/LeadsTable";
import { exportCSV } from "@/components/leads/export-csv";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      toast.error("Erro ao carregar leads");
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = leads;
    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (l) =>
          l.company_name?.toLowerCase().includes(q) ||
          l.contact_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q)
      );
    }
    if (filters.funnelStatus !== "all") {
      result = result.filter((l) => l.funnel_status === filters.funnelStatus);
    }
    if (filters.state) {
      result = result.filter((l) => l.state?.toUpperCase() === filters.state);
    }
    if (filters.hasEmail) {
      result = result.filter((l) => !!l.email);
    }
    if (filters.hasPhone) {
      result = result.filter((l) => !!l.phone);
    }
    return result;
  }, [leads, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filters]);

  const handleStatusChange = async (id: string, status: Lead["funnel_status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, funnel_status: status } : l)));
    const { error } = await supabase.from("leads").update({ funnel_status: status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status");
      fetchLeads();
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Meus Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} lead{filtered.length !== 1 && "s"} encontrado{filtered.length !== 1 && "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <LeadsFilterSidebar filters={filters} onChange={setFilters} />

        <div className="flex-1 space-y-4">
          <LeadsTable leads={paginated} onStatusChange={handleStatusChange} onLeadUpdated={fetchLeads} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
