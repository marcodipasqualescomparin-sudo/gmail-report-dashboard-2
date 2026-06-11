import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Mail, FileText, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">Report Dashboard</div>
            <Link href="/dashboard">
              <Button>Accedi alla Dashboard</Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-slate-900">Gestisci i tuoi Report</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Una dashboard elegante e intuitiva per visualizzare, filtrare e gestire i report email e DDT con facilità.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Vai alla Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Report Dashboard</div>
          <a href={getLoginUrl()}>
            <Button>Accedi</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-slate-900 leading-tight">
            Gestisci i tuoi Report con Eleganza
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Una dashboard raffinata e intuitiva per visualizzare, filtrare e gestire i report email di Fabio Andreani e i DDT prodotti HERO in tempo reale.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <a href={getLoginUrl()}>
            <Button size="lg" className="gap-2">
              Inizia Ora <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
          <Button size="lg" variant="outline">
            Scopri di Più
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">Funzionalità Principali</h2>
          <p className="text-slate-600 mt-2">Tutto ciò che ti serve per gestire i report in modo efficiente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Email Fabio Andreani</CardTitle>
              <CardDescription>Gestisci con classificazione priorità</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Visualizza tutte le email da Fabio Andreani con classificazione automatica in ALTA, MEDIA e BASSA priorità.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>DDT Prodotti HERO</CardTitle>
              <CardDescription>Traccia iPhone, iPad, MacBook, Apple Watch</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Monitora i report DDT e trasferimenti dei prodotti HERO con filtri avanzati per mittente, ricevente e fornitore.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Filtri Avanzati</CardTitle>
              <CardDescription>Localizza report con precisione</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Utilizza filtri sofisticati per categoria prodotto, mittente, ricevente e fornitore per trovare esattamente quello che cerchi.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle>Storico Completo</CardTitle>
              <CardDescription>Accedi a tutti i report storici</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Visualizza la timeline completa di tutti i report con navigazione per data e filtri per tipo di report.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle>Sincronizzazione Automatica</CardTitle>
              <CardDescription>Dati sempre aggiornati</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                I report vengono sincronizzati automaticamente nel database per garantire dati sempre freschi e accurati.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Mail className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Responsive Design</CardTitle>
              <CardDescription>Perfetto su desktop e mobile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Interfaccia elegante e intuitiva che si adatta perfettamente a qualsiasi dispositivo, da desktop a smartphone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">Pronto a Iniziare?</CardTitle>
            <CardDescription className="text-blue-100">
              Accedi subito e inizia a gestire i tuoi report con la massima efficienza
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="gap-2">
                Accedi Ora <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2026 Gmail Report Dashboard. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
