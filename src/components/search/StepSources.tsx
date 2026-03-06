import { useWizard } from "./SearchWizardContext";
import { cn } from "@/lib/utils";
import { Globe, Instagram, Facebook, Linkedin, Database, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const SOURCES = [
  { value: "google_maps", label: "Google Maps", description: "Empresas listadas no Google", icon: MapPin },
  { value: "instagram", label: "Instagram", description: "Perfis comerciais", icon: Instagram },
  { value: "facebook", label: "Facebook", description: "Páginas de negócios", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", description: "Empresas e profissionais", icon: Linkedin },
  { value: "cnpj", label: "Base CNPJ", description: "Receita Federal / dados públicos", icon: Database },
  { value: "websites", label: "Websites", description: "Busca em sites e diretórios", icon: Globe },
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
    if (data.sources.length === SOURCES.length) {
      updateData({ sources: [] });
    } else {
      updateData({ sources: SOURCES.map((s) => s.value) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Fontes de Dados</h2>
          <p className="text-sm text-muted-foreground mt-1">Escolha de onde deseja coletar os leads.</p>
        </div>
        <button type="button" onClick={selectAll} className="text-sm text-primary hover:underline font-medium">
          {data.sources.length === SOURCES.length ? "Desmarcar todos" : "Selecionar todos"}
        </button>
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
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md",
                selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
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

      <p className="text-xs text-muted-foreground">
        {data.sources.length} fonte{data.sources.length !== 1 && "s"} selecionada{data.sources.length !== 1 && "s"}
      </p>
    </div>
  );
}
