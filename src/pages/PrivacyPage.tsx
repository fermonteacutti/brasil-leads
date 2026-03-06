import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-10">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            {[
              { title: "1. Controlador e Encarregado de Dados (DPO)", content: "O LeadScan PRO é o controlador dos dados pessoais coletados nesta plataforma. O Encarregado de Proteção de Dados pode ser contatado pelo e-mail: privacidade@leadscanpro.com.br" },
              { title: "2. Dados Coletados", content: "Coletamos dados fornecidos diretamente pelo usuário (nome, e-mail, empresa, dados de pagamento) e dados de uso da plataforma (logs de acesso, buscas realizadas, funcionalidades utilizadas)." },
              { title: "3. Finalidade do Tratamento", content: "Os dados são tratados para: prestação do serviço contratado; comunicações sobre a conta; melhorias na plataforma; cumprimento de obrigações legais; e, com consentimento, envio de comunicações de marketing." },
              { title: "4. Base Legal", content: "O tratamento é baseado em: execução de contrato (prestação do serviço); legítimo interesse (melhorias e segurança); consentimento (marketing); e cumprimento de obrigação legal (dados fiscais)." },
              { title: "5. Compartilhamento com Terceiros", content: "Compartilhamos dados apenas com: processadores de pagamento (Stripe); infraestrutura cloud (Supabase); serviços de e-mail transacional (Resend); e quando exigido por lei." },
              { title: "6. Retenção e Exclusão", content: "Dados são mantidos enquanto a conta estiver ativa. Após cancelamento, mantemos dados por 30 dias para possível reativação, e dados fiscais por 5 anos conforme legislação." },
              { title: "7. Direitos do Titular", content: "Você tem direito a: acessar seus dados; corrigir dados incompletos; solicitar exclusão; portabilidade dos dados; revogar consentimento; e obter informações sobre compartilhamento." },
              { title: "8. Cookies e Rastreamento", content: "Utilizamos cookies essenciais para funcionamento da plataforma, cookies de analytics para melhorias, e cookies de marketing (com consentimento). Você pode gerenciar suas preferências a qualquer momento." },
              { title: "9. Segurança dos Dados", content: "Empregamos criptografia SSL/TLS, acesso restrito a dados pessoais, monitoramento contínuo de segurança, e backups regulares para proteger suas informações." },
              { title: "10. Exercício de Direitos", content: "Para exercer seus direitos como titular de dados, entre em contato pelo e-mail: privacidade@leadscanpro.com.br. Responderemos em até 15 dias úteis conforme a LGPD." },
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
