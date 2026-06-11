import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS_PRIORITY = {
  ALTA: "#ef4444",
  MEDIA: "#eab308",
  BASSA: "#22c55e",
};

const COLORS_CATEGORY = {
  iPhone: "#3b82f6",
  iPad: "#a855f7",
  MacBook: "#6b7280",
  "Apple Watch": "#f97316",
};

const COLORS_TYPE = {
  DDT: "#10b981",
  TRASFERIMENTO: "#3b82f6",
};

export default function Statistics() {
  const { isAuthenticated } = useAuth();

  const andreaniStats = trpc.reports.statistics.andreani.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const ddtStats = trpc.reports.statistics.ddt.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const trendData = trpc.reports.statistics.trend.useQuery(
    { days: 30 },
    { enabled: isAuthenticated }
  );

  // Prepare data for Andreani pie chart
  const andreaniChartData = andreaniStats.data?.byPriority
    ? Object.entries(andreaniStats.data.byPriority).map(([priority, count]) => ({
        name: priority,
        value: count,
      }))
    : [];

  // Prepare data for DDT category pie chart
  const ddtCategoryChartData = ddtStats.data?.byCategory
    ? Object.entries(ddtStats.data.byCategory).map(([category, count]) => ({
        name: category,
        value: count,
      }))
    : [];

  // Prepare data for DDT type bar chart
  const ddtTypeChartData = ddtStats.data?.byType
    ? Object.entries(ddtStats.data.byType).map(([type, count]) => ({
        name: type,
        count,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Statistiche Report</h1>
            <p className="text-muted-foreground">Visualizza analitiche e trend dei tuoi report</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Email Andreani</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{andreaniStats.data?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Report ricevuti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total DDT/Trasferimenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ddtStats.data?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Report ricevuti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Priorità Più Alta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {andreaniStats.data && 'byPriority' in andreaniStats.data
                  ? (andreaniStats.data.byPriority as Record<string, number>).ALTA || 0
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Email ALTA priorità</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Andreani Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Priorità Email Andreani</CardTitle>
              <CardDescription>Suddivisione per livello di priorità</CardDescription>
            </CardHeader>
            <CardContent>
              {andreaniStats.isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Caricamento...
                </div>
              ) : andreaniChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={andreaniChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {andreaniChartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS_PRIORITY[entry.name as keyof typeof COLORS_PRIORITY]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>

          {/* DDT Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Categorie Prodotto</CardTitle>
              <CardDescription>DDT e Trasferimenti per categoria HERO</CardDescription>
            </CardHeader>
            <CardContent>
              {ddtStats.isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Caricamento...
                </div>
              ) : ddtCategoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ddtCategoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ddtCategoryChartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS_CATEGORY[entry.name as keyof typeof COLORS_CATEGORY]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>

          {/* DDT Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Tipo Report</CardTitle>
              <CardDescription>DDT vs Trasferimenti</CardDescription>
            </CardHeader>
            <CardContent>
              {ddtStats.isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Caricamento...
                </div>
              ) : ddtTypeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ddtTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                      {ddtTypeChartData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS_TYPE[entry.name as keyof typeof COLORS_TYPE]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Ultimi 30 Giorni</CardTitle>
              <CardDescription>Andamento ricevimento report nel tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Caricamento...
                </div>
              ) : trendData.data && trendData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval={Math.floor(trendData.data.length / 7)}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Andreani"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="DDT"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nessun dato disponibile
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
