import { useState, useEffect } from "react";
import { Lead } from "./lead-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, X, Plus, Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";

interface Props {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export default function LeadDetailSheet({ lead, open, onOpenChange, onUpdated }: Props) {
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes ?? "");
      setTags(lead.tags ?? []);
      setNewTag("");
    }
  }, [lead]);

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({ notes, tags })
      .eq("id", lead.id);

    if (error) {
      toast.error("Erro ao salvar alterações");
    } else {
      toast.success("Lead atualizado com sucesso");
      onUpdated();
    }
    setSaving(false);
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {lead.company_name || "Sem nome"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Informações</Label>
            <div className="space-y-1.5 text-sm">
              {lead.contact_name && (
                <p className="text-foreground font-medium">{lead.contact_name}</p>
              )}
              {lead.email && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {lead.phone}
                </span>
              )}
              {lead.website && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {lead.website}
                  </a>
                </span>
              )}
              {(lead.city || lead.state) && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {[lead.city, lead.state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nova tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="h-8 text-sm"
              />
              <Button variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Notas</Label>
            <Textarea
              placeholder="Adicione observações sobre este lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="text-sm resize-none"
            />
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
