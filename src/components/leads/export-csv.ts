import { Lead } from "./lead-types";

export function exportCSV(leads: Lead[]) {
  const headers = [
    "Empresa", "Contato", "E-mail", "Telefone", "Website",
    "Cidade", "Estado", "Segmento", "CNPJ", "Status Funil", "Tags", "Fonte"
  ];

  const rows = leads.map((l) => [
    l.company_name ?? "",
    l.contact_name ?? "",
    l.email ?? "",
    l.phone ?? "",
    l.website ?? "",
    l.city ?? "",
    l.state ?? "",
    l.segment ?? "",
    l.cnpj ?? "",
    l.funnel_status,
    (l.tags ?? []).join("; "),
    l.source ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
