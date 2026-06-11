import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, FileText, BarChart3, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const andreaniReports = trpc.reports.andreani.list.useQuery({ limit: 5 }, { enabled: isAuthenticated });
  const ddtReports = trpc.reports.ddt.list.useQuery({ limit: 5 }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return <div>Accedi per visualizzare la dashboard</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard Report</h1>
          <p className="text-muted-foreground mt-2">Gestisci e visualizza i tuoi report email e DDT</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Report Andreani</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{andreaniReports.data?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">ultimi report</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Report DDT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ddtReports.data?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">ultimi report</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Priorità Alta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {andreaniReports.data?.filter(r => r.priority === 'ALTA').length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">da gestire</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ultimi Aggiornamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Oggi</div>
              <p className="text-xs text-muted-foreground mt-1">sincronizzazione</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Andreani Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Fabio Andreani
              </CardTitle>
              <CardDescription>Ultimi report con classificazione priorità</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {andreaniReports.isLoading ? (
                <div className="text-sm text-muted-foreground">Caricamento...</div>
              ) : andreaniReports.data?.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nessun report disponibile</div>
              ) : (
                <div className="space-y-3">
                  {andreaniReports.data?.slice(0, 3).map(report => (
                    <div key={report.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-accent">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{report.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.receivedAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        report.priority === 'ALTA' ? 'bg-red-100 text-red-700' :
                        report.priority === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {report.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/reports/andreani">
                <Button variant="outline" className="w-full">Visualizza Tutti</Button>
              </Link>
            </CardContent>
          </Card>

          {/* DDT Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                DDT Prodotti HERO
              </CardTitle>
              <CardDescription>Ultimi trasferimenti e report DDT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ddtReports.isLoading ? (
                <div className="text-sm text-muted-foreground">Caricamento...</div>
              ) : ddtReports.data?.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nessun report disponibile</div>
              ) : (
                <div className="space-y-3">
                  {ddtReports.data?.slice(0, 3).map(report => (
                    <div key={report.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-accent">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{report.reportNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.productCategory} • {new Date(report.receivedAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {report.reportType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/reports/ddt">
                <Button variant="outline" className="w-full">Visualizza Tutti</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/reports/history">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Storico Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Visualizza e filtra i report per data</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/statistics">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Analisi e grafici dettagliati</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Sincronizzazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ultima sincronizzazione: ora</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
