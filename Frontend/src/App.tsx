import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import BookingDemo from "./pages/BookingDemo";
import AIPracticeDemo from "./pages/AIPracticeDemo";
import ParentDashboardDemo from "./pages/ParentDashboardDemo";
import AllPrograms from "./pages/AllPrograms";
import NotFound from "./pages/NotFound";
import CurriculumPage from "./pages/CurriculumPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import StudentSessionDetailPage from "./pages/StudentSessionDetailPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboard from "./pages/AdminDashboard";
import { ChatWidget } from "./components/chat/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              {/* ========== PUBLIC ROUTES ========== */}
              {/* Accessible by everyone, no authentication required */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/inaugural-program" element={<AllPrograms />} />
              
              {/* Auth redirect - redirects to appropriate dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* ========== STUDENT ONLY ROUTES ========== */}
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-practice"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AIPracticeDemo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BookingDemo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/curriculum"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CurriculumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/curriculum/:moduleId"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ModuleDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/connections"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ConnectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={["student", "teacher"]}>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:moduleId"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              
              {/* ========== PARENT ONLY ROUTES ========== */}
              <Route
                path="/parent-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentDashboardDemo />
                  </ProtectedRoute>
                }
              />
              
              {/* ========== TEACHER ONLY ROUTES ========== */}
              <Route
                path="/teacher-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <StudentSessionDetailPage />
                  </ProtectedRoute>
                }
              />
              
              {/* ========== ADMIN ONLY ROUTES ========== */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* ========== CATCH-ALL ========== */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Chat Widget for all authenticated users (except admin) */}
              <ChatWidget />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
