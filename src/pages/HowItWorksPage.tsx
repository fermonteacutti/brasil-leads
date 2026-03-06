import { motion } from "framer-motion";
import { MapPin, Search, Download, Database, Shield, Globe, Linkedin, Instagram, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const timeline = [
  { icon: Search, title: "1. Você configura a busca", desc: "Defina o nicho de mercado, a localização geográfica e as fontes de dados que deseja utilizar." },
  { icon: Database, title: "2. Nosso motor coleta dados", desc: "Nosso sistema acessa fontes públicas como Google Maps, Google Search, LinkedIn e redes sociais para encontrar empresas e contatos." },
  { icon: Shield, title: "3. Dados são validados", desc: "Cada lead passa por verificação de formato de e-mail, DDD do telefone e deduplicação automática." },
  { icon: Download, title: "4. Você recebe os resultados", desc: "Leads aparecem na sua conta em tempo real. Exporte em CSV/Excel ou gerencie direto na plataforma." },
];

const sources = [
  { icon: MapPin, name: "Google Maps", items: ["Nome da empresa", "Endereço completo", "Telefone", "Website", "Avaliações", "Horários"] },
  { icon: Globe, name: "Google Search", items: ["Sites corporativos", "E-mails públicos", "Perfis profissionais", "Diretórios setoriais"] },
  { icon: Linkedin, name: "LinkedIn", items: ["Nome do decisor", "Cargo", "Empresa", "Setor de atuação"] },
  { icon: Instagram, name: "Redes Sociais", items: ["Perfis comerciais", "Contatos públicos", "Segmento", "Localização"] },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="py-20 md:py-24">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Como o LeadScan PRO <span className="text-gradient">funciona</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um processo simples e automatizado para você encontrar leads qualificados em minutos.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative space-y-8">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            {timeline.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-6 md:pl-8"
              >
                <div className="hidden md:flex absolute -left-0 h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border-4 border-background z-10">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="md:ml-14 p-6 rounded-xl border border-border bg-card shadow-soft flex-1">
                  <div className="flex items-center gap-3 mb-2 md:hidden">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 hidden md:block">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fontes detalhadas */}
      <section id="fontes" className="py-20 bg-card border-y border-border">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Fontes de dados detalhadas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sources.map((source, i) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-background"
              >
                <div className="flex items-center gap-3 mb-4">
                  <source.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">{source.name}</h3>
                </div>
                <ul className="space-y-2">
                  {source.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-6">Teste grátis por 7 dias. Sem cartão de crédito.</p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/login?cadastro=true">Começar Grátis</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
