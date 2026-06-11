import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChevronLeft, Copy, Check, Mail, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ShareSettings() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);

  const invites = trpc.invites.list.useQuery(undefined, { enabled: isAuthenticated });
  const sendInvite = trpc.invites.send.useMutation();
  const accessUsers = trpc.access.list.useQuery(undefined, { enabled: isAuthenticated });

  const handleSendInvite = async () => {
    if (!email) {
      toast.error("Inserisci un indirizzo email");
      return;
    }

    setInviteSending(true);
    try {
      const result = await sendInvite.mutateAsync({ email });
      toast.success(`Invito inviato a ${email}`);
      setEmail("");
      invites.refetch();
    } catch (error) {
      toast.error("Errore nell'invio dell'invito");
    } finally {
      setInviteSending(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiato negli appunti");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
            <h1 className="text-3xl font-bold">Condivisione e Accessi</h1>
            <p className="text-muted-foreground">Invita altri utenti ad accedere alla dashboard</p>
          </div>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle>Invita un Nuovo Utente</CardTitle>
            <CardDescription>Inserisci l'indirizzo email dell'utente che desideri invitare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSendInvite}
                disabled={inviteSending || !email}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {inviteSending ? "Invio..." : "Invita"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              L'invito scadrà tra 7 giorni. L'utente dovrà accettarlo per ottenere l'accesso.
            </p>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        <Card>
          <CardHeader>
            <CardTitle>Inviti in Sospeso</CardTitle>
            <CardDescription>Gestisci gli inviti inviati</CardDescription>
          </CardHeader>
          <CardContent>
            {invites.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : invites.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nessun invito inviato</div>
            ) : (
              <div className="space-y-3">
                {invites.data?.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{invite.invitedEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Scade il {new Date(invite.expiresAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(invite.status)}>
                        {invite.status === "pending" ? "In sospeso" : invite.status === "accepted" ? "Accettato" : "Rifiutato"}
                      </Badge>
                      {invite.status === "pending" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Copia Link
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Link di Invito</DialogTitle>
                              <DialogDescription>
                                Condividi questo link con {invite.invitedEmail}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2">
                              <Input
                                readOnly
                                value={`${window.location.origin}/accept-invite?token=${invite.token}`}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => copyInviteLink(invite.token)}
                                size="sm"
                                variant="outline"
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Utenti con Accesso</CardTitle>
            <CardDescription>Utenti che hanno accettato l'invito</CardDescription>
          </CardHeader>
          <CardContent>
            {accessUsers.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : accessUsers.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nessun utente con accesso</div>
            ) : (
              <div className="space-y-3">
                {accessUsers.data?.map((access) => (
                  <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Utente ID: {access.userId}</p>
                      <p className="text-sm text-muted-foreground">
                        Aggiunto il {new Date(access.createdAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {access.permission === "view" ? "Visualizzazione" : access.permission === "view_export" ? "Visualizzazione + Export" : "Admin"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
