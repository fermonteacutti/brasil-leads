import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUNNEL_OPTIONS } from "./lead-types";
import { Search, X } from "lucide-react";

export interface LeadFilters {
  search: string;
  funnelStatus: string;
  state: string;
  hasEmail: boolean;
  hasPhone: boolean;
}

const EMPTY: LeadFilters = { search: "", funnelStatus: "all", state: "", hasEmail: false, hasPhone: false };

interface Props {
  filters: LeadFilters;
  onChange: (f: LeadFilters) => void;
}

export default function LeadsFilterSidebar({ filters, onChange }: Props) {
  const update = (partial: Partial<LeadFilters>) => onChange({ ...filters, ...partial });
  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar leads..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9"
          maxLength={100}
        />
      </div>

      {/* Funnel */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status do Funil</Label>
        <Select value={filters.funnelStatus} onValueChange={(v) => update({ funnelStatus: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {FUNNEL_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</Label>
        <Input
          placeholder="Ex: SP"
          value={filters.state}
          onChange={(e) => update({ state: e.target.value.toUpperCase() })}
          maxLength={2}
        />
      </div>

      {/* Contact filters */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={filters.hasEmail} onCheckedChange={(v) => update({ hasEmail: !!v })} />
          <span className="text-sm text-foreground">Possui e-mail</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={filters.hasPhone} onCheckedChange={(v) => update({ hasPhone: !!v })} />
          <span className="text-sm text-foreground">Possui telefone</span>
        </label>
      </div>

      {dirty && (
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onChange(EMPTY)}>
          <X className="h-4 w-4 mr-1" /> Limpar filtros
        </Button>
      )}
    </aside>
  );
}

export { EMPTY as DEFAULT_FILTERS };
