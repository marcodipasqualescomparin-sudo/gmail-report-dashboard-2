import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function AcceptInvite() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptInvite = trpc.invites.accept.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const handleAccept = async () => {
      setAccepting(true);
      try {
        const result = await acceptInvite.mutateAsync({ token });
        if (result.success) {
          setAccepted(true);
          toast.success("Invito accettato con successo!");
          setTimeout(() => {
            setLocation("/dashboard");
          }, 2000);
        } else {
          setError("Non è stato possibile accettare l'invito. Potrebbe essere scaduto.");
        }
      } catch (err) {
        setError("Errore nell'accettazione dell'invito. Riprova più tardi.");
        console.error(err);
      } finally {
        setAccepting(false);
      }
    };

    handleAccept();
  }, [isAuthenticated, token, acceptInvite, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accedi per Accettare l'Invito</CardTitle>
            <CardDescription>Devi essere autenticato per accettare un invito</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accedi con il tuo account per continuare.
            </p>
            <Button onClick={() => window.location.href = "/api/oauth/login"} className="w-full">
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accetta Invito</CardTitle>
          <CardDescription>Stai per accedere alla Dashboard dei Report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accepting && (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="w-8 h-8 mb-4" />
              <p className="text-sm text-muted-foreground">Elaborazione in corso...</p>
            </div>
          )}

          {accepted && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-700 mb-2">Invito Accettato!</p>
              <p className="text-sm text-muted-foreground text-center">
                Stai per essere reindirizzato alla dashboard...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-semibold text-red-700 mb-2">Errore</p>
              <p className="text-sm text-muted-foreground text-center">{error}</p>
              <Button onClick={() => setLocation("/dashboard")} className="mt-4 w-full">
                Vai alla Dashboard
              </Button>
            </div>
          )}

          {!accepting && !accepted && !error && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Accettando questo invito, otterrai accesso alla dashboard dei report.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Utente: {user?.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
