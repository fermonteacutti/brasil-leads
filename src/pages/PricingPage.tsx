import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 97,
    credits: 500,
    searches: 1,
    popular: false,
    features: [
      { label: "500 créditos/mês", included: true },
      { label: "1 busca simultânea", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Google Maps + Search", included: true },
      { label: "Até 1.000 leads salvos", included: true },
      { label: "Suporte e-mail (48h)", included: true },
      { label: "Todas as fontes", included: false },
      { label: "API Access", included: false },
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 197,
    credits: 2000,
    searches: 3,
    popular: true,
    features: [
      { label: "2.000 créditos/mês", included: true },
      { label: "3 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes de dados", included: true },
      { label: "Leads salvos ilimitados", included: true },
      { label: "Chat prioritário (4h)", included: true },
      { label: "API Access", included: true },
      { label: "Suporte dedicado", included: false },
    ],
  },
  {
    name: "Business",
    monthlyPrice: 397,
    credits: 6000,
    searches: 10,
    popular: false,
    features: [
      { label: "6.000 créditos/mês", included: true },
      { label: "10 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes de dados", included: true },
      { label: "Leads salvos ilimitados", included: true },
      { label: "Suporte dedicado (1h)", included: true },
      { label: "API Access", included: true },
      { label: "Gerente de conta", included: true },
    ],
  },
];

const faqs = [
  { q: "O que são créditos?", a: "Cada crédito equivale a 1 lead coletado. Fontes como LinkedIn e Instagram consomem 2 créditos por lead." },
  { q: "Posso trocar de plano?", a: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor é calculado proporcionalmente." },
  { q: "Os créditos acumulam?", a: "Não. Créditos não utilizados expiram no final do ciclo de 30 dias." },
  { q: "Posso comprar créditos avulsos?", a: "Sim! Oferecemos pacotes de 100, 500 e 1.000 créditos adicionais." },
  { q: "Existe período de teste?", a: "Sim! Oferecemos 7 dias gratuitos com créditos de teste para você experimentar." },
  { q: "Como funciona o cancelamento?", a: "Cancele quando quiser sem multa. Você mantém acesso até o fim do período pago." },
  { q: "Os dados são seguros?", a: "Sim. Usamos criptografia SSL, conformidade LGPD e os dados ficam em servidores seguros." },
  { q: "Preciso de cartão para o trial?", a: "Não! Os 7 dias gratuitos não exigem cartão de crédito." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <section className="py-20 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Planos simples, resultados <span className="text-gradient">extraordinários</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Escolha o plano ideal para o tamanho da sua operação. Todos incluem 7 dias grátis.
            </p>

            <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Anual <span className="text-xs ml-1 opacity-80">-20%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-2xl border ${
                    plan.popular
                      ? "border-accent shadow-glow bg-card"
                      : "border-border bg-card shadow-soft"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Mais Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">R$ {price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full mb-6"
                    asChild
                  >
                    <Link to={`/login?cadastro=true&plano=${plan.name.toLowerCase()}`}>
                      Começar Grátis
                    </Link>
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat.label} className="flex items-center gap-2 text-sm">
                        {feat.included ? (
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={feat.included ? "text-foreground" : "text-muted-foreground/50"}>{feat.label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Garantia */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 max-w-2xl mx-auto text-center p-6 rounded-xl border border-success/20 bg-success/5"
          >
            <p className="font-semibold text-success">🛡️ Garantia de 7 dias</p>
            <p className="text-sm text-muted-foreground mt-1">
              Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-background">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-3">Precisa de um plano customizado?</h2>
          <p className="text-muted-foreground mb-6">
            Para equipes grandes ou necessidades específicas, entre em contato para um plano Enterprise.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/contato">Falar com Vendas</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
