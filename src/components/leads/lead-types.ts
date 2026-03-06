import { Tables } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;

export const FUNNEL_OPTIONS: { value: Lead["funnel_status"]; label: string; color: string }[] = [
  { value: "new", label: "Novo", color: "bg-blue-500/15 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Contatado", color: "bg-amber-500/15 text-amber-700 border-amber-200" },
  { value: "proposal", label: "Proposta", color: "bg-violet-500/15 text-violet-700 border-violet-200" },
  { value: "closed", label: "Fechado", color: "bg-emerald-500/15 text-emerald-700 border-emerald-200" },
  { value: "lost", label: "Perdido", color: "bg-red-500/15 text-red-700 border-red-200" },
];

export function funnelLabel(status: Lead["funnel_status"]) {
  return FUNNEL_OPTIONS.find((o) => o.value === status) ?? FUNNEL_OPTIONS[0];
}
