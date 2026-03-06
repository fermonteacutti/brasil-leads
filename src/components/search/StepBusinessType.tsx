import { useWizard } from "./SearchWizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ShoppingBag, Utensils, Wrench, GraduationCap, HeartPulse, Briefcase, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "restaurantes", label: "Restaurantes", icon: Utensils },
  { value: "lojas", label: "Lojas/Varejo", icon: ShoppingBag },
  { value: "servicos", label: "Serviços", icon: Wrench },
  { value: "saude", label: "Saúde", icon: HeartPulse },
  { value: "educacao", label: "Educação", icon: GraduationCap },
  { value: "escritorios", label: "Escritórios", icon: Briefcase },
  { value: "industria", label: "Indústria", icon: Building2 },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
];

export default function StepBusinessType() {
  const { data, updateData } = useWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Tipo de Negócio</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione o tipo de empresa que deseja buscar.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BUSINESS_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => updateData({ businessType: value })}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md",
              data.businessType === value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <Icon className={cn("h-7 w-7", data.businessType === value ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-sm font-medium", data.businessType === value ? "text-primary" : "text-foreground")}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="segment">Segmento específico (opcional)</Label>
        <Input
          id="segment"
          placeholder="Ex: Pizzarias, Pet Shops, Clínicas dentárias..."
          value={data.segment}
          onChange={(e) => updateData({ segment: e.target.value })}
          maxLength={100}
        />
      </div>
    </div>
  );
}
