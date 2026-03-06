import { motion } from "framer-motion";
import {
  Search,
  Users,
  Download,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { semana: "Sem 1", leads: 45 },
  { semana: "Sem 2", leads: 78 },
  { semana: "Sem 3", leads: 62 },
  { semana: "Sem 4", leads: 120 },
  { semana: "Sem 5", leads: 95 },
  { semana: "Sem 6", leads: 140 },
];

const recentSearches = [
  {
    id: "1",
    name: "Escritórios de Contabilidade",
    location: "São Paulo, SP",
    status: "completed" as const,
    leads: 87,
    date: "Hoje, 14:30",
  },
  {
    id: "2",
    name: "Clínicas Odontológicas",
    location: "Rio de Janeiro, RJ",
    status: "running" as const,
    leads: 34,
    date: "Hoje, 10:15",
  },
  {
    id: "3",
    name: "Academias e Studios",
    location: "Belo Horizonte, MG",
    status: "completed" as const,
    leads: 156,
    date: "Ontem, 18:00",
  },
  {
    id: "4",
    name: "Restaurantes e Bares",
    location: "Curitiba, PR",
    status: "failed" as const,
    leads: 0,
    date: "Ontem, 09:20",
  },
  {
    id: "5",
    name: "Imobiliárias",
    location: "Florianópolis, SC",
    status: "completed" as const,
    leads: 64,
    date: "3 dias atrás",
  },
];

const statusConfig = {
  completed: {
    label: "Concluída",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
  },
  running: {
    label: "Em andamento",
    icon: Clock,
    className: "bg-info/10 text-info border-info/20",
  },
  failed: {
    label: "Falhou",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  const creditsUsed = 142;
  const creditsTotal = 1000;
  const creditsPercent = (creditsUsed / creditsTotal) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo da sua conta.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/app/busca">
            <Search className="h-4 w-4 mr-2" /> Nova Busca
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Créditos Disponíveis
                </span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {creditsTotal - creditsUsed}
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{creditsUsed} usados</span>
                  <span>{creditsTotal} total</span>
                </div>
                <Progress value={creditsPercent} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Leads Coletados
                </span>
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-success" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">341</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +28% vs. semana passada
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Buscas Realizadas
                </span>
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground mt-1">
                Neste ciclo de 30 dias
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Exportações
                </span>
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Download className="h-4 w-4 text-warning" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground mt-1">
                CSV e Excel este mês
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart + Plan Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-soft h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Leads Coletados por Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="semana"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="leads"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-soft h-full bg-hero text-primary-foreground">
            <CardContent className="pt-6 flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium opacity-80">Plano Atual</p>
                <p className="text-2xl font-bold mt-1">Professional</p>
                <p className="text-sm opacity-70 mt-2">
                  1.000 créditos/mês • Renova em 15 dias
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
                  asChild
                >
                  <Link to="/app/creditos">
                    <CreditCard className="h-4 w-4 mr-2" /> Gerenciar Plano
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Searches */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Buscas Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/app/busca">
                Ver todas <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearches.map((search) => {
                const cfg = statusConfig[search.status];
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={search.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {search.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {search.location} • {search.date}
                      </p>
                    </div>
                    <Badge variant="outline" className={cfg.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                    {search.leads > 0 && (
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {search.leads} leads
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link
          to="/app/busca"
          className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-medium transition-all"
        >
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Nova Busca</p>
            <p className="text-xs text-muted-foreground">
              Encontrar novos leads
            </p>
          </div>
        </Link>

        <Link
          to="/app/leads"
          className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-medium transition-all"
        >
          <div className="h-11 w-11 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
            <Users className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Ver Leads</p>
            <p className="text-xs text-muted-foreground">
              Central de contatos
            </p>
          </div>
        </Link>

        <Link
          to="/app/creditos"
          className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-medium transition-all"
        >
          <div className="h-11 w-11 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
            <Download className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Exportar</p>
            <p className="text-xs text-muted-foreground">
              CSV ou Excel
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
