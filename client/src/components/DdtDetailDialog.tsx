import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { DdtReport } from "@/lib/types";

interface DdtDetailDialogProps {
  report: DdtReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DdtDetailDialog({ report, open, onOpenChange }: DdtDetailDialogProps) {
  if (!report) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{report.reportNumber}</DialogTitle>
              <DialogDescription className="mt-2">
                Ricevuto il {new Date(report.receivedAt).toLocaleDateString('it-IT')} alle{' '}
                {new Date(report.receivedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo Report</p>
              <div className="mt-2">
                <Badge className={getReportTypeColor(report.reportType)}>
                  {report.reportType}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categoria Prodotto</p>
              <div className="mt-2">
                <Badge className={getProductColor(report.productCategory)}>
                  {report.productCategory}
                </Badge>
              </div>
            </div>
          </div>

          {/* Sender, Recipient, Supplier */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mittente</p>
              <p className="mt-2 text-sm">{report.sender || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ricevente</p>
              <p className="mt-2 text-sm">{report.recipient || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fornitore</p>
              <p className="mt-2 text-sm">{report.supplier || '-'}</p>
            </div>
          </div>

          {/* Quantity */}
          {report.quantity && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantità</p>
              <p className="mt-2 text-sm">{report.quantity} unità</p>
            </div>
          )}

          {/* Details */}
          {report.details && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dettagli</p>
              <div className="mt-2 p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm leading-relaxed">{report.details}</p>
              </div>
            </div>
          )}

          {/* Message ID */}
          {report.messageId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Messaggio</p>
              <p className="mt-2 text-xs font-mono text-muted-foreground break-all">{report.messageId}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Creato</p>
              <p>{new Date(report.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
            <div>
              <p className="font-medium">Aggiornato</p>
              <p>{new Date(report.updatedAt).toLocaleDateString('it-IT')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
