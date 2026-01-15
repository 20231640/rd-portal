import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClassesPage from "./pages/ClassesPage";
import { useAutoLogout } from "./hooks/useAutoLogout";
import AdminStatistics from "./pages/AdminStatistics";
import AdminTrainingsPage from "./pages/AdminTrainingsPage";
import TeacherTrainingsPage from "./pages/TeacherTrainingsPage";
import TeacherFeedback from './pages/TeacherFeedback'; 
import AdminFeedbackReports from './pages/AdminFeedbackReports'; 
import ContactAdmin from './pages/ContactAdmin';
import TeacherKitsPage from "./pages/TeacherKitsPage";
import AdminKitsPage from "./pages/AdminKitsPage";
import AdminExport from "./pages/AdminExport";

import VerifyEmail from "./pages/verify-email";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";

export default function App() {
  const { showWarning, countdown, resetTimer } = useAutoLogout(15 * 60 * 1000);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      
      {/* Modal de aviso centralizado */}
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-yellow-400 p-6 rounded-lg shadow-lg w-96 text-center">
            <p className="mb-4 text-black font-semibold">
              Sua sessão vai expirar em {countdown} segundos!
            </p>
            <button
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              onClick={resetTimer}
            >
              Continuar Sessão
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* NOVAS ROTAS DE AUTENTICAÇÃO */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Rotas do Teacher */}
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/trainings" element={<TeacherTrainingsPage />} />
          <Route path="/feedback" element={<TeacherFeedback />} />
          <Route path="/contact-admin" element={<ContactAdmin />} />
          <Route path="/kits" element={<TeacherKitsPage />} /> 
          
          {/* Rotas do Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/stats" element={<AdminStatistics />} />
          <Route path="/admin/trainings" element={<AdminTrainingsPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackReports />} />
          <Route path="/admin/kits" element={<AdminKitsPage />} /> 
          <Route path="/admin/export" element={<AdminExport />} />
          
        </Routes> 
      </main>
    </div>
  );
}