import { useState } from "react";
import { Lead, funnelLabel } from "./lead-types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUNNEL_OPTIONS } from "./lead-types";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import LeadDetailSheet from "./LeadDetailSheet";

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: Lead["funnel_status"]) => void;
  onLeadUpdated: () => void;
}

export default function LeadsTable({ leads, onStatusChange, onLeadUpdated }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum lead encontrado</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Ajuste os filtros ou inicie uma nova busca.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[220px]">Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[150px]">Funil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const funnel = funnelLabel(lead.funnel_status);
              return (
                <TableRow
                  key={lead.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {lead.company_name || "Sem nome"}
                    </p>
                    {lead.contact_name && (
                      <p className="text-xs text-muted-foreground truncate">{lead.contact_name}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {lead.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </span>
                      )}
                      {lead.website && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" /> {lead.website}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(lead.city || lead.state) ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {[lead.city, lead.state].filter(Boolean).join(", ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {(lead.tags?.length ?? 0) > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{(lead.tags?.length ?? 0) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={lead.funnel_status}
                      onValueChange={(v) => onStatusChange(lead.id, v as Lead["funnel_status"])}
                    >
                      <SelectTrigger className={cn("h-7 text-xs border", funnel.color)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNNEL_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        onUpdated={() => {
          setSelectedLead(null);
          onLeadUpdated();
        }}
      />
    </>
  );
}
