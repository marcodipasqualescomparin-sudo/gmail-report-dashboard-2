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
import { AndreaniDetailDialog } from "@/components/AndreaniDetailDialog";
import type { AndreaniReport } from "@/lib/types";
import { exportAndreaniToExcel, exportAndreaniToPdf } from "@/lib/exportUtils";
import { Download } from "lucide-react";

export default function ReportsAndEvents() {
  const { isAuthenticated } = useAuth();
  const [priority, setPriority] = useState<string | undefined>();
  const [sender, setSender] = useState<string>("Fabio Andreani");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<AndreaniReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const uniqueSenders = trpc.reports.andreani.uniqueSenders.useQuery(undefined, { enabled: isAuthenticated });
  const allReports = trpc.reports.andreani.bySender.useQuery({ sender, limit: 100 }, { enabled: isAuthenticated });
  const priorityReports = trpc.reports.andreani.bySenderAndPriority.useQuery(
    { sender, priority: priority as any },
    { enabled: isAuthenticated && !!priority }
  );

  const reports = priority ? priorityReports.data : allReports.data;
  const filtered = reports?.filter(r =>
    r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'ALTA': return 'bg-red-100 text-red-700';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-700';
      case 'BASSA': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isEventMittente = (senderName: string) => {
    const eventMittenti = ['Factorial', 'SalesCoach', 'Eventbrite', 'Meetup'];
    return eventMittenti.some(m => senderName.toLowerCase().includes(m.toLowerCase()));
  };

  const getMittenteBadge = (senderName: string) => {
    if (isEventMittente(senderName)) {
      return <Badge className="bg-purple-100 text-purple-700">Evento</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700">Report</Badge>;
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
            <h1 className="text-3xl font-bold">Report e Eventi</h1>
            <p className="text-muted-foreground">Gestisci email, report e notifiche di eventi da diversi mittenti</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Seleziona mittente</label>
                <Select value={sender} onValueChange={setSender}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleziona mittente" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSenders.data?.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} {isEventMittente(s) ? '(Evento)' : '(Report)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Cerca per oggetto o sintesi</label>
                <Input
                  placeholder="Scrivi per cercare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Filtra per priorità</label>
                <Select value={priority || "all"} onValueChange={(val) => setPriority(val === "all" ? undefined : val)}>
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
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report e Eventi ({filtered.length})</CardTitle>
                <CardDescription>Elenco completo con classificazione priorità e tipo</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAndreaniToExcel(filtered)}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAndreaniToPdf(filtered)}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {allReports.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nessun report trovato</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Oggetto</TableHead>
                      <TableHead>Priorità</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mittente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Sintesi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(report => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setSelectedReport(report);
                          setDialogOpen(true);
                        }}
                      >
                        <TableCell className="font-medium max-w-xs truncate">{report.subject}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getMittenteBadge(report.sender || '')}
                        </TableCell>
                        <TableCell className="text-sm">{report.sender || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(report.receivedAt).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                          {report.summary || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AndreaniDetailDialog
          report={selectedReport}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
