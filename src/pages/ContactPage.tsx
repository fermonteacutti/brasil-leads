import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Mensagem enviada com sucesso! Retornaremos em até 4 horas úteis.");
    }, 1000);
  };

  return (
    <section className="py-20 md:py-24">
      <div className="container max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Entre em contato</h1>
          <p className="text-muted-foreground text-lg">
            Respondemos em até 4 horas úteis. Estamos aqui para ajudar!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome</label>
                <Input placeholder="Seu nome" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <Input type="email" placeholder="seu@email.com" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Empresa</label>
              <Input placeholder="Nome da empresa" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Assunto</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione o assunto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="duvida">Dúvida sobre a plataforma</SelectItem>
                  <SelectItem value="planos">Planos e preços</SelectItem>
                  <SelectItem value="suporte">Suporte técnico</SelectItem>
                  <SelectItem value="enterprise">Plano Enterprise</SelectItem>
                  <SelectItem value="parceria">Parceria</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
              <Textarea placeholder="Como podemos ajudar?" rows={5} required />
            </div>
            <Button variant="hero" type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-4">Informações de Contato</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "contato@leadscanpro.com.br" },
                  { icon: Phone, label: "+55 (11) 99999-0000" },
                  { icon: MapPin, label: "São Paulo, SP — Brasil" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://wa.me/5511999990000?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20LeadScan%20PRO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-6 rounded-xl border border-success/20 bg-success/5 hover:bg-success/10 transition-colors"
            >
              <MessageCircle className="h-8 w-8 text-success" />
              <div>
                <p className="font-semibold text-sm">WhatsApp Business</p>
                <p className="text-xs text-muted-foreground">Fale conosco em tempo real</p>
              </div>
            </a>

            <div className="rounded-xl overflow-hidden border border-border h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976!2d-46.6523!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzknMDguMyJX!5e0!3m2!1spt-BR!2sbr!4v1234"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Localização"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
