import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AndreaniReports from "./pages/AndreaniReports";
import DdtReports from "./pages/DdtReports";
import ReportHistory from "./pages/ReportHistory";
import Statistics from "./pages/Statistics";
import ShareSettings from "./pages/ShareSettings";
import AcceptInvite from "./pages/AcceptInvite";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/reports/andreani"} component={AndreaniReports} />
      <Route path={"/reports/ddt"} component={DdtReports} />
      <Route path={"/reports/history"} component={ReportHistory} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/share-settings"} component={ShareSettings} />
      <Route path={"/accept-invite"} component={AcceptInvite} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
