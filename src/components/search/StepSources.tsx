import { useWizard } from "./SearchWizardContext";
import { cn } from "@/lib/utils";
import { Globe, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const SOURCES = [
  {
    value: "redes_sociais",
    label: "Google Maps",
    description: "Busca por estabelecimentos no Google Maps",
    icon: Globe,
    disabled: false,
  },
  {
    value: "cnpj",
    label: "Base CNPJ",
    description: "Em breve",
    icon: Database,
    disabled: true,
  },
];

export default function StepSources() {
  const { data, updateData } = useWizard();

  const toggle = (value: string) => {
    const next = data.sources.includes(value)
      ? data.sources.filter((s) => s !== value)
      : [...data.sources, value];
    updateData({ sources: next });
  };

  

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Fontes de Dados</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha de onde deseja coletar os leads.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOURCES.map(({ value, label, description, icon: Icon, disabled }) => {
          const selected = data.sources.includes(value);

          return (
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
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {data.sources.length} fonte{data.sources.length !== 1 && "s"} selecionada{data.sources.length !== 1 && "s"}
      </p>
    </div>
  );
}
