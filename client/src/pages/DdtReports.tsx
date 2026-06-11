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
import { DdtDetailDialog } from "@/components/DdtDetailDialog";
import type { DdtReport } from "@/lib/types";
import { exportDdtToExcel, exportDdtToPdf } from "@/lib/exportUtils";
import { Download } from "lucide-react";

export default function DdtReports() {
  const { isAuthenticated } = useAuth();
  const [productCategory, setProductCategory] = useState<string>("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [supplier, setSupplier] = useState("");
  const [selectedReport, setSelectedReport] = useState<DdtReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const reports = trpc.reports.ddt.byFilters.useQuery(
    {
      productCategory: productCategory || undefined,
      sender: sender || undefined,
      recipient: recipient || undefined,
      supplier: supplier || undefined,
    },
    { enabled: isAuthenticated }
  );

  const filtered = reports.data || [];

  const getProductColor = (category: string) => {
    switch (category) {
      case 'iPhone': return 'bg-blue-100 text-blue-700';
      case 'iPad': return 'bg-purple-100 text-purple-700';
      case 'MacBook': return 'bg-gray-100 text-gray-700';
      case 'Apple Watch': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getReportTypeColor = (type: string) => {
    return type === 'DDT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
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
            <h1 className="text-3xl font-bold">DDT e Trasferimenti HERO</h1>
            <p className="text-muted-foreground">Gestisci i report DDT e trasferimenti prodotti HERO</p>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtri Avanzati</CardTitle>
            <CardDescription>Localizza report per mittente, ricevente, fornitore e categoria prodotto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categoria Prodotto */}
              <div>
                <label className="text-sm font-medium">Categoria Prodotto</label>
                <Select value={productCategory || "all"} onValueChange={(val) => setProductCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    <SelectItem value="iPhone">iPhone</SelectItem>
                    <SelectItem value="iPad">iPad</SelectItem>
                    <SelectItem value="MacBook">MacBook</SelectItem>
                    <SelectItem value="Apple Watch">Apple Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mittente */}
              <div>
                <label className="text-sm font-medium">Mittente</label>
                <Input
                  placeholder="Cerca mittente..."
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Ricevente */}
              <div>
                <label className="text-sm font-medium">Ricevente</label>
                <Input
                  placeholder="Cerca ricevente..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Fornitore */}
              <div>
                <label className="text-sm font-medium">Fornitore</label>
                <Input
                  placeholder="Cerca fornitore..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setProductCategory("");
                  setSender("");
                  setRecipient("");
                  setSupplier("");
                }}
              >
                Ripristina Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report DDT e Trasferimenti ({filtered.length})</CardTitle>
                <CardDescription>Elenco completo dei report DDT e trasferimenti</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportDdtToExcel(filtered)}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportDdtToPdf(filtered)}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reports.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : reports.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nessun report trovato con i filtri selezionati</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero Report</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Mittente</TableHead>
                      <TableHead>Ricevente</TableHead>
                      <TableHead>Fornitore</TableHead>
                      <TableHead>Quantità</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.data?.map(report => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setSelectedReport(report);
                          setDialogOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">{report.reportNumber}</TableCell>
                        <TableCell>
                          <Badge className={getReportTypeColor(report.reportType)}>
                            {report.reportType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getProductColor(report.productCategory)}>
                            {report.productCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{report.sender || '-'}</TableCell>
                        <TableCell className="text-sm">{report.recipient || '-'}</TableCell>
                        <TableCell className="text-sm">{report.supplier || '-'}</TableCell>
                        <TableCell className="text-sm">{report.quantity || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(report.receivedAt).toLocaleDateString('it-IT')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <DdtDetailDialog
          report={selectedReport}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
