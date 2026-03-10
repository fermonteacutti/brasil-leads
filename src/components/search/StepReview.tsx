import { useWizard } from "./SearchWizardContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MapPin, Database, Filter, Zap } from "lucide-react";

export default function StepReview() {
  const { data } = useWizard();

  const bothSources = data.sources.includes("redes_sociais") && data.sources.includes("cnpj");
  const baseCredits = data.sources.length * (data.nationwide ? 50 : 10);
  const estimatedCredits = bothSources ? Math.ceil(baseCredits * 1.5) : baseCredits;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" /> Revisão da Busca
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Confira os detalhes antes de iniciar.</p>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Business type */}
        <div className="p-4 flex items-start gap-3">
          <Database className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Negócio</p>
            <p className="text-sm font-medium text-foreground capitalize">{data.businessType || "—"}</p>
            {data.segment && <p className="text-xs text-muted-foreground mt-0.5">{data.segment}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Localização</p>
            <p className="text-sm font-medium text-foreground">
              {data.nationwide
                ? "Nacional (todo o Brasil)"
                : [data.city, data.state].filter(Boolean).join(", ") || "—"}
            </p>
            {data.radius && <p className="text-xs text-muted-foreground mt-0.5">Raio: {data.radius} km</p>}
          </div>
        </div>

        {/* Sources */}
        <div className="p-4 flex items-start gap-3">
          <Database className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Fontes</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.sources.length > 0
                ? data.sources.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s === "redes_sociais" ? "Redes Sociais" : s === "cnpj" ? "Base CNPJ" : s.replace("_", " ")}
                  </Badge>
                ))
                : <span className="text-sm text-muted-foreground">Nenhuma selecionada</span>}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 flex items-start gap-3">
          <Filter className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Filtros Ativos</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.hasEmail && <Badge variant="outline" className="text-xs">E-mail</Badge>}
              {data.hasPhone && <Badge variant="outline" className="text-xs">Telefone</Badge>}
              {data.hasWebsite && <Badge variant="outline" className="text-xs">Website</Badge>}
              {data.hasSocialMedia && <Badge variant="outline" className="text-xs">Redes Sociais</Badge>}
              {!data.hasEmail && !data.hasPhone && !data.hasWebsite && !data.hasSocialMedia && (
                <span className="text-sm text-muted-foreground">Nenhum filtro</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Créditos estimados</p>
            <p className="text-xs text-muted-foreground">Consumo aproximado para esta busca</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-primary">{estimatedCredits}</span>
      </div>

      {data.searchName && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Nome:</span> {data.searchName}
        </p>
      )}
    </div>
  );
}
