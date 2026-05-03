import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home";
import Routines from "./pages/Routines";
import RoutineDetail from "./pages/RoutineDetail";
import NewRoutine from "./pages/NewRoutine";
import Practice from "./pages/Practice";
import Record from "./pages/Record";
import Review from "./pages/Review";
import Reflect from "./pages/Reflect";
import Profile from "./pages/Profile";
import History from "./pages/History";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/routines/new" element={<NewRoutine />} />
          <Route path="/routines/:id" element={<RoutineDetail />} />
          <Route path="/practice/:routineId" element={<Practice />} />
          <Route path="/record/:routineId" element={<Record />} />
          <Route path="/review/:sessionId" element={<Review />} />
          <Route path="/reflect/:sessionId" element={<Reflect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
