import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { AndreaniReport } from "@/lib/types";

interface AndreaniDetailDialogProps {
  report: AndreaniReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AndreaniDetailDialog({ report, open, onOpenChange }: AndreaniDetailDialogProps) {
  if (!report) return null;

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'ALTA': return 'bg-red-100 text-red-700';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-700';
      case 'BASSA': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{report.subject}</DialogTitle>
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
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Priorità</p>
              <div className="mt-2">
                <Badge className={getPriorityColor(report.priority)}>
                  {report.priority}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mittente</p>
              <p className="mt-2 text-sm">{report.sender || 'Fabio Andreani'}</p>
            </div>
          </div>

          {/* Summary */}
          {report.summary && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sintesi</p>
              <div className="mt-2 p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm leading-relaxed">{report.summary}</p>
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
