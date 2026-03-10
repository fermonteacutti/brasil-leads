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

  const bothSelected = data.sources.includes("redes_sociais") && data.sources.includes("cnpj");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Fontes de Dados</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha de onde deseja coletar os leads.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOURCES.map(({ value, label, description, icon: Icon }) => {
          const selected = data.sources.includes(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                selected
                  ? "border-primary bg-primary/5 hover:shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-md"
              )}
            >
              <Checkbox checked={selected} className="pointer-events-none" />
              <Icon className={cn("h-5 w-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className={cn("text-sm font-medium", selected ? "text-primary" : "text-foreground")}>{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {bothSelected && (
        <div className="rounded-lg bg-accent/50 border border-accent p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Ambas as fontes selecionadas:</span>{" "}
            o custo por lead gerado será acrescido ao utilizar as duas bases simultaneamente.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {data.sources.length} fonte{data.sources.length !== 1 && "s"} selecionada{data.sources.length !== 1 && "s"}
      </p>
    </div>
  );
}
