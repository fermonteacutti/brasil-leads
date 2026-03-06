import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-10">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            {[
              { title: "1. Definições e Natureza do Serviço", content: "O LeadScan PRO é uma plataforma SaaS de prospecção de leads que coleta dados públicos de diversas fontes da internet. O serviço é oferecido mediante assinatura e funciona com um sistema de créditos para coleta de dados." },
              { title: "2. Cadastro e Responsabilidades do Usuário", content: "Ao se cadastrar, o usuário declara ter mais de 18 anos e fornecer informações verdadeiras. O usuário é responsável pela segurança de sua conta e senha, e por todo uso feito em sua conta." },
              { title: "3. Regras de Uso dos Dados Coletados", content: "Os dados coletados pela plataforma são provenientes de fontes públicas e devem ser utilizados exclusivamente para fins comerciais legítimos. É proibido o uso para spam, assédio, discriminação ou qualquer finalidade ilegal." },
              { title: "4. Créditos, Planos e Política de Reembolso", content: "Os créditos são consumidos conforme a coleta de leads. Créditos não utilizados expiram ao final do ciclo de 30 dias. Oferecemos garantia de 7 dias com reembolso total caso o cliente não fique satisfeito." },
              { title: "5. Propriedade Intelectual", content: "Todo o conteúdo, design, código e funcionalidades da plataforma são de propriedade exclusiva do LeadScan PRO. O uso da plataforma não concede ao usuário qualquer direito de propriedade intelectual." },
              { title: "6. Limitação de Responsabilidade", content: "O LeadScan PRO não garante a precisão, completude ou atualidade dos dados coletados de fontes públicas. A responsabilidade pelo uso dos dados é exclusiva do usuário." },
              { title: "7. Política de Uso Aceitável", content: "É proibido: utilizar a plataforma para scraping ilegal; enviar spam; violar termos de serviço de terceiros; compartilhar credenciais; revender dados sem autorização; ou tentar acessar sistemas não autorizados." },
              { title: "8. Rescisão e Cancelamento", content: "O usuário pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo até o final do período pago. O LeadScan PRO reserva-se o direito de suspender contas que violem estes termos." },
              { title: "9. Legislação Aplicável", content: "Estes termos são regidos pelas leis da República Federativa do Brasil, em especial a LGPD (Lei 13.709/2018). O foro da comarca de São Paulo/SP é eleito para dirimir quaisquer controvérsias." },
              { title: "10. Canal de Contato", content: "Para questões legais, entre em contato pelo e-mail: juridico@leadscanpro.com.br" },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
