import { useWizard } from "./SearchWizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Globe } from "lucide-react";

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function StepLocation() {
  const { data, updateData } = useWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Localização</h2>
        <p className="text-sm text-muted-foreground mt-1">Defina a área geográfica da busca.</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border-2 border-border p-4 bg-card">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Busca Nacional</p>
          <p className="text-xs text-muted-foreground">Buscar em todo o Brasil</p>
        </div>
        <Switch
          checked={data.nationwide}
          onCheckedChange={(v) => updateData({ nationwide: v, state: "", city: "" })}
        />
      </div>

      {!data.nationwide && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={data.state} onValueChange={(v) => updateData({ state: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={data.city}
                  onChange={(e) => updateData({ city: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Raio de busca (km) — opcional</Label>
            <Input
              type="number"
              min={1}
              max={500}
              placeholder="Ex: 50"
              value={data.radius ?? ""}
              onChange={(e) => updateData({ radius: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
