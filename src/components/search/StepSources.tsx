import { useWizard } from "./SearchWizardContext";
import { cn } from "@/lib/utils";
import { Globe, Instagram, Facebook, Linkedin, Database, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SOURCES = [
  { value: "google_maps", label: "Google Maps", description: "Empresas listadas no Google", icon: MapPin },
  { value: "instagram", label: "Instagram", description: "Perfis comerciais", icon: Instagram },
  { value: "facebook", label: "Facebook", description: "Páginas de negócios", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", description: "Empresas e profissionais", icon: Linkedin, disabled: true },
  { value: "cnpj", label: "Base CNPJ", description: "Receita Federal / dados públicos", icon: Database },
  { value: "websites", label: "Websites", description: "Busca em sites e diretórios", icon: Globe, disabled: true },
];

export default function StepSources() {
  const { data, updateData } = useWizard();

  const toggle = (value: string) => {
    const next = data.sources.includes(value)
      ? data.sources.filter((s) => s !== value)
      : [...data.sources, value];
    updateData({ sources: next });
  };

  const selectAll = () => {
    const available = SOURCES.filter((s) => !s.disabled).map((s) => s.value);
    if (available.every((v) => data.sources.includes(v))) {
      updateData({ sources: [] });
    } else {
      updateData({ sources: available });
    }
  };

  const allAvailableSelected = SOURCES.filter((s) => !s.disabled).every((s) => data.sources.includes(s.value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Fontes de Dados</h2>
          <p className="text-sm text-muted-foreground mt-1">Escolha de onde deseja coletar os leads.</p>
        </div>
        <button type="button" onClick={selectAll} className="text-sm text-primary hover:underline font-medium">
          {allAvailableSelected ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOURCES.map(({ value, label, description, icon: Icon, disabled }) => {
            const selected = data.sources.includes(value);

            const card = (
              <button
                key={value}
                type="button"
                onClick={() => !disabled && toggle(value)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                  disabled
                    ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    : selected
                      ? "border-primary bg-primary/5 hover:shadow-md"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                )}
              >
                <Checkbox checked={selected} disabled={disabled} className="pointer-events-none" />
                <Icon className={cn("h-5 w-5 shrink-0", disabled ? "text-muted-foreground/50" : selected ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", disabled ? "text-muted-foreground" : selected ? "text-primary" : "text-foreground")}>{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            );

            if (disabled) {
              return (
                <Tooltip key={value}>
                  <TooltipTrigger asChild>{card}</TooltipTrigger>
                  <TooltipContent><p>Em Breve</p></TooltipContent>
                </Tooltip>
              );
            }

            return card;
          })}
        </div>
      </TooltipProvider>

      <p className="text-xs text-muted-foreground">
        {data.sources.length} fonte{data.sources.length !== 1 && "s"} selecionada{data.sources.length !== 1 && "s"}
      </p>
    </div>
  );
}
