import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, TrendingUp, TrendingDown, Gift, RotateCcw, ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Credit = Tables<"credits">;

const TRANSACTION_META: Record<string, { label: string; icon: typeof TrendingUp; color: string }> = {
  plan_renewal: { label: "Renovação", icon: RotateCcw, color: "text-primary" },
  purchase: { label: "Compra", icon: ShoppingCart, color: "text-emerald-600" },
  usage: { label: "Uso", icon: TrendingDown, color: "text-destructive" },
  refund: { label: "Reembolso", icon: RotateCcw, color: "text-amber-600" },
  bonus: { label: "Bônus", icon: Gift, color: "text-violet-600" },
};

const CREDIT_PACKS = [
  { amount: 100, price: 29, popular: false },
  { amount: 300, price: 69, popular: true },
  { amount: 1000, price: 199, popular: false },
];

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setCredits(data);
        setBalance(data[0].balance_after);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Créditos e Plano</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seu saldo de créditos e adquira pacotes adicionais.</p>
      </div>

      {/* Balance card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary/10 p-3">
            <Coins className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saldo atual</p>
            <p className="text-3xl font-bold text-foreground">{balance.toLocaleString("pt-BR")} <span className="text-base font-normal text-muted-foreground">créditos</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Credit packs */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Comprar créditos</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.amount} className={pack.popular ? "border-primary shadow-md ring-1 ring-primary/20" : ""}>
              <CardHeader className="pb-2">
                {pack.popular && <Badge className="w-fit mb-1">Mais popular</Badge>}
                <CardTitle className="text-xl">{pack.amount} créditos</CardTitle>
                <CardDescription>R$ {pack.price},00</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">R$ {(pack.price / pack.amount).toFixed(2)}/crédito</p>
                <Button className="w-full" variant={pack.popular ? "default" : "outline"}>
                  <CreditCard className="mr-2 h-4 w-4" /> Comprar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de transações</h2>
        <Card>
          <CardContent className="p-0">
            {credits.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credits.map((tx) => {
                    const meta = TRANSACTION_META[tx.transaction_type] ?? TRANSACTION_META.usage;
                    const Icon = meta.icon;
                    const isPositive = tx.amount > 0;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${meta.color}`} />
                            <span className="text-sm font-medium">{meta.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tx.description ?? "—"}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${isPositive ? "text-emerald-600" : "text-destructive"}`}>
                          {isPositive ? "+" : ""}{tx.amount}
                        </TableCell>
                        <TableCell className="text-right text-sm">{tx.balance_after}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
