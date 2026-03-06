import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Radar, Search, Download, MapPin, Globe, Linkedin, Instagram,
  Star, ChevronRight, Zap, Shield, Users, ArrowRight
} from "lucide-react";

const stats = [
  { value: "47.832", label: "Leads gerados hoje" },
  { value: "2.100+", label: "Empresas ativas" },
  { value: "98%", label: "Satisfação" },
];

const steps = [
  { icon: MapPin, title: "Configure o Nicho", description: "Escolha segmento, localização e fontes de dados para sua busca personalizada." },
  { icon: Search, title: "Acione a Busca", description: "Nossa IA coleta dados de múltiplas fontes públicas em segundos." },
  { icon: Download, title: "Exporte os Leads", description: "Baixe em CSV/Excel ou salve na sua conta para gerenciar seus contatos." },
];

const sources = [
  { icon: MapPin, name: "Google Maps", desc: "Endereços, telefones, avaliações" },
  { icon: Globe, name: "Google Search", desc: "Sites, e-mails, perfis públicos" },
  { icon: Linkedin, name: "LinkedIn", desc: "Cargos, decisores, empresas" },
  { icon: Instagram, name: "Instagram", desc: "Perfis comerciais, contatos" },
];

const testimonials = [
  { name: "Carlos Mendes", role: "CEO", company: "Contab Digital", text: "Em 2 semanas geramos mais de 800 leads qualificados. O ROI foi absurdo.", rating: 5 },
  { name: "Ana Beatriz", role: "Diretora Comercial", company: "TechSales BR", text: "Substituímos 3 ferramentas pelo LeadScan PRO. Simples e poderoso.", rating: 5 },
  { name: "Roberto Lima", role: "Fundador", company: "Consultoria RCL", text: "A qualidade dos leads é incomparável. Já fechamos 12 contratos novos.", rating: 5 },
  { name: "Fernanda Torres", role: "Head de Vendas", company: "EduTech Plus", text: "O wizard de busca é intuitivo e os resultados chegam em minutos.", rating: 5 },
  { name: "Marcelo Silva", role: "Sócio", company: "Silva & Associados", text: "Ferramenta essencial para qualquer equipe comercial B2B.", rating: 5 },
  { name: "Juliana Rocha", role: "Growth Manager", company: "StartUp Flow", text: "Economizamos 40h/mês em prospecção manual. Recomendo demais!", rating: 5 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(217_91%_60%/0.15),transparent_60%)]" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-accent/20">
                <Zap className="h-3.5 w-3.5" /> Prospecção inteligente com IA
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
                Encontre seus próximos clientes{" "}
                <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">em segundos</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                Sem planilhas, sem pesquisa manual. LeadScan PRO localiza leads qualificados do seu nicho em todo o Brasil usando dados públicos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-lg font-semibold text-base h-12 px-8" asChild>
                  <Link to="/login?cadastro=true">
                    Começar Grátis — 7 dias <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8" asChild>
                  <Link to="/como-funciona">Ver como funciona</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-sm text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 md:py-24">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Três passos simples para começar a prospectar leads qualificados.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="relative p-8 rounded-2xl border border-border bg-card shadow-soft hover:shadow-medium transition-shadow duration-300 text-center group"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="absolute top-4 right-4 text-5xl font-black text-muted/50">{i + 1}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fontes de Dados */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Fontes de dados integradas
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Coletamos informações de múltiplas fontes públicas para entregar leads completos.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sources.map((source, i) => (
              <motion.div
                key={source.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center p-6 rounded-xl border border-border bg-background hover:shadow-medium transition-all duration-300"
              >
                <source.icon className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-semibold text-sm mb-1">{source.name}</h4>
                <p className="text-xs text-muted-foreground text-center">{source.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Busca Ultrarrápida", desc: "Resultados em segundos usando múltiplas APIs e scraping inteligente." },
              { icon: Shield, title: "100% Compliance", desc: "Dados públicos coletados em conformidade com a LGPD e GDPR." },
              { icon: Users, title: "CRM Integrado", desc: "Gerencie leads com tags, status de funil e notas personalizadas." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-8 rounded-2xl bg-primary/5 border border-primary/10"
              >
                <feat.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Quem usa, recomenda
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-warning text-warning" />)}
              <span className="ml-2 font-semibold">4.9/5</span>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-xl border border-border bg-background"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} • {t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para acelerar suas vendas?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground mb-8">
              Comece gratuitamente e veja resultados em minutos. Sem cartão de crédito.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="hero" size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/login?cadastro=true">
                  Começar Grátis — 7 dias <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
