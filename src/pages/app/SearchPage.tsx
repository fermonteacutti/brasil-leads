import { useNavigate } from "react-router-dom";
import { WizardProvider, useWizard } from "@/components/search/SearchWizardContext";
import StepBusinessType from "@/components/search/StepBusinessType";
import StepLocation from "@/components/search/StepLocation";
import StepSources from "@/components/search/StepSources";
import StepFilters from "@/components/search/StepFilters";
import StepReview from "@/components/search/StepReview";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const StepComponent = STEPS[step].component;
  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = () => {
    if (step === 0) return !!data.businessType;
    if (step === 1) return data.nationwide || !!data.state;
    if (step === 2) return data.sources.length > 0;
    return true;
  };

  const handleSubmit = () => {
    toast.success("Busca criada com sucesso! Processamento iniciado.", {
      description: "Você será notificado quando os resultados estiverem prontos.",
    });
    navigate("/app");
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
          <Button onClick={handleSubmit} disabled={!canNext()} variant="hero">
            <Rocket className="h-4 w-4 mr-1" />
            Iniciar Busca
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
