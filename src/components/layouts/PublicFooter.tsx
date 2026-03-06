import { Link } from "react-router-dom";
import { Radar } from "lucide-react";

const footerLinks = {
  Produto: [
    { label: "Como Funciona", href: "/como-funciona" },
    { label: "Planos e Preços", href: "/planos" },
    { label: "Fontes de Dados", href: "/como-funciona#fontes" },
  ],
  Empresa: [
    { label: "Contato", href: "/contato" },
    { label: "Sobre Nós", href: "/contato" },
  ],
  Legal: [
    { label: "Termos de Uso", href: "/termos-de-uso" },
    { label: "Política de Privacidade", href: "/politica-de-privacidade" },
    { label: "LGPD", href: "/politica-de-privacidade" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Radar className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-foreground">Lead<span className="text-accent">Scan</span> PRO</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma de prospecção inteligente. Encontre leads qualificados do seu nicho em todo o Brasil.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">LGPD</span>
              <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full font-medium">SSL Seguro</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LeadScan PRO. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Pagamento seguro via Stripe • Dados protegidos pela LGPD
          </p>
        </div>
      </div>
    </footer>
  );
}
