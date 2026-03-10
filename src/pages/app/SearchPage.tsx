import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WizardProvider, useWizard } from "@/components/search/SearchWizardContext";
import StepBusinessType from "@/components/search/StepBusinessType";
import StepLocation from "@/components/search/StepLocation";
import StepSources from "@/components/search/StepSources";
import StepFilters from "@/components/search/StepFilters";
import StepReview from "@/components/search/StepReview";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { label: "Negócio", component: StepBusinessType },
  { label: "Localização", component: StepLocation },
  { label: "Fontes", component: StepSources },
  { label: "Filtros", component: StepFilters },
  { label: "Revisão", component: StepReview },
];

function WizardContent() {
  const { step, setStep, data } = useWizard();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const StepComponent = STEPS[step].component;
  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = () => {
    if (step === 0) return !!data.businessType;
    if (step === 1) return data.nationwide || !!data.state;
    if (step === 2) return data.sources.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        toast.error("Você precisa estar logado para criar uma busca.");
        navigate("/login");
        return;
      }

      const filters: Record<string, boolean> = {};
      if (data.hasEmail) filters.hasEmail = true;
      if (data.hasPhone) filters.hasPhone = true;
      if (data.hasWebsite) filters.hasWebsite = true;
      if (data.hasSocialMedia) filters.hasSocialMedia = true;

      const estimatedCredits = data.nationwide ? 50 : 10;

      const { data: insertedSearch, error } = await supabase.from("searches").insert({
        user_id: userId,
        business_type: data.businessType,
        nationwide: data.nationwide,
        location_state: data.state || null,
        location_city: data.city || null,
        location_radius: data.radius,
        sources: data.sources,
        filters,
        credits_estimated: estimatedCredits,
        name: data.searchName || null,
        status: "queued",
      }).select("id").single();

      if (error || !insertedSearch) throw error || new Error("Falha ao criar busca");

      toast.info("Busca criada! Buscando leads no Google Maps...");

      // Invoke edge function to search leads
      const { data: result, error: fnError } = await supabase.functions.invoke("search-leads", {
        body: { search_id: insertedSearch.id },
      });

      if (fnError) {
        toast.error("Erro ao buscar leads", { description: fnError.message });
      } else {
        toast.success(`Busca concluída! ${result?.leads_found || 0} leads encontrados.`);
      }

      navigate("/app/leads");
    } catch (err: any) {
      toast.error("Erro ao criar busca", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nova Busca</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Etapa {step + 1} de {STEPS.length}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-2">
        <Progress value={progress} className="h-1.5" />
      </div>
      <div className="flex justify-between mb-8">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => i < step && setStep(i)}
            disabled={i > step}
            className={cn(
              "text-xs font-medium transition-colors",
              i === step ? "text-primary" : i < step ? "text-muted-foreground hover:text-foreground cursor-pointer" : "text-muted-foreground/40"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[340px]">
        <StepComponent />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? navigate("/app") : setStep(step - 1))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {step === 0 ? "Cancelar" : "Voltar"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canNext() || submitting} variant="hero">
            {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Rocket className="h-4 w-4 mr-1" />}
            {submitting ? "Criando..." : "Iniciar Busca"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
