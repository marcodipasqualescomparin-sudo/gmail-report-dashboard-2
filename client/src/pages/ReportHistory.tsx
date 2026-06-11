import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ReportHistory() {
  const { isAuthenticated } = useAuth();
  const [reportType, setReportType] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const andreaniReports = trpc.reports.andreani.list.useQuery({ limit: 100 }, { enabled: isAuthenticated });
  const ddtReports = trpc.reports.ddt.list.useQuery({ limit: 100 }, { enabled: isAuthenticated });

  // Combine and sort all reports by date
  const allReports = [
    ...(andreaniReports.data?.map(r => ({ ...r, type: 'ANDREANI' as const })) || []),
    ...(ddtReports.data?.map(r => ({ ...r, type: 'DDT' as const })) || []),
  ].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const filtered = allReports.filter(report => {
    if (reportType && reportType !== 'all' && report.type !== reportType) return false;
    if (priority && priority !== 'all' && 'priority' in report && report.priority !== priority) return false;
    return true;
  });

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'ALTA': return 'bg-red-100 text-red-700';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-700';
      case 'BASSA': return 'bg-green-100 text-green-700';
      default: return '';
    }
  };

  const getProductColor = (category?: string) => {
    switch (category) {
      case 'iPhone': return 'bg-blue-100 text-blue-700';
      case 'iPad': return 'bg-purple-100 text-purple-700';
      case 'MacBook': return 'bg-gray-100 text-gray-700';
      case 'Apple Watch': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
            <h1 className="text-3xl font-bold">Storico Report</h1>
            <p className="text-muted-foreground">Visualizza e filtra i report per data e tipo</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo di Report</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="ANDREANI">Email Fabio Andreani</SelectItem>
                    <SelectItem value="DDT">DDT e Trasferimenti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'ANDREANI' && (
                <div>
                  <label className="text-sm font-medium">Priorità</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Tutte le priorità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le priorità</SelectItem>
                      <SelectItem value="ALTA">ALTA</SelectItem>
                      <SelectItem value="MEDIA">MEDIA</SelectItem>
                      <SelectItem value="BASSA">BASSA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline ({filtered.length})</CardTitle>
            <CardDescription>Elenco cronologico di tutti i report</CardDescription>
          </CardHeader>
          <CardContent>
            {andreaniReports.isLoading || ddtReports.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nessun report trovato</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((report, idx) => (
                  <div key={`${report.type}-${report.id}`} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 w-24">
                      <div className="text-sm font-semibold text-muted-foreground">
                        {new Date(report.receivedAt).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(report.receivedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {report.type === 'ANDREANI' && 'subject' in report ? (
                            <>
                              <p className="font-medium">{report.subject}</p>
                              <p className="text-sm text-muted-foreground mt-1">{report.summary}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge className={getPriorityColor(report.priority)}>
                                  {report.priority}
                                </Badge>
                                <Badge variant="outline">Email</Badge>
                              </div>
                            </>
                          ) : report.type === 'DDT' && 'reportNumber' in report ? (
                            <>
                              <p className="font-medium">{report.reportNumber}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {report.sender && `Da: ${report.sender}`}
                                {report.recipient && ` • A: ${report.recipient}`}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge className={getProductColor(report.productCategory)}>
                                  {report.productCategory}
                                </Badge>
                                <Badge variant="outline">{report.reportType}</Badge>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
