import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/RequireAuth";
import Home from "./pages/Home";
import Routines from "./pages/Routines";
import RoutineDetail from "./pages/RoutineDetail";
import NewRoutine from "./pages/NewRoutine";
import EditRoutine from "./pages/EditRoutine";
import Practice from "./pages/Practice";
import Record from "./pages/Record";
import Review from "./pages/Review";
import Reflect from "./pages/Reflect";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const guard = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={guard(<Home />)} />
            <Route path="/routines" element={guard(<Routines />)} />
            <Route path="/routines/new" element={guard(<NewRoutine />)} />
            <Route path="/routines/:id" element={guard(<RoutineDetail />)} />
            <Route path="/routines/:id/edit" element={guard(<EditRoutine />)} />
            <Route path="/practice/:routineId" element={guard(<Practice />)} />
            <Route path="/record/:routineId" element={guard(<Record />)} />
            <Route path="/review/:sessionId" element={guard(<Review />)} />
            <Route path="/reflect/:sessionId" element={guard(<Reflect />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="/history" element={guard(<History />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
