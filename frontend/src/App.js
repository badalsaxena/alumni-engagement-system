import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import PendingApprovalPage from "@/pages/PendingApprovalPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import MentorsPage from "@/pages/student/MentorsPage";
import StudentConnectionsPage from "@/pages/student/StudentConnectionsPage";
import StudentChatPage from "@/pages/student/StudentChatPage";
import KnowledgeHubPage from "@/pages/student/KnowledgeHubPage";
import AlumniDashboard from "@/pages/alumni/AlumniDashboard";
import RequestsPage from "@/pages/alumni/RequestsPage";
import AlumniConnectionsPage from "@/pages/alumni/AlumniConnectionsPage";
import AlumniChatPage from "@/pages/alumni/AlumniChatPage";
import BlogsPage from "@/pages/alumni/BlogsPage";
import LeaderboardPage from "@/pages/alumni/LeaderboardPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import VerifyPage from "@/pages/admin/VerifyPage";
import UsersPage from "@/pages/admin/UsersPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import BlogFeedPage from "@/pages/BlogFeedPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import SetupPage from "@/pages/SetupPage";

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!profile) return <Navigate to="/onboarding" replace />;
  if (profile.role === 'alumni' && profile.status === 'pending') return <Navigate to="/pending-approval" replace />;
  if (requiredRole && profile.role !== requiredRole) return <Navigate to={`/${profile.role}`} replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user && profile) return <Navigate to={`/${profile.role}`} replace />;
  return children;
}

function App() {
  return (
    <div className="noise-overlay">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/setup" element={<SetupPage />} />
            {/* Shared Routes */}
            <Route path="/blog/:blogId" element={<ProtectedRoute><BlogDetailPage /></ProtectedRoute>} />
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/mentors" element={<ProtectedRoute requiredRole="student"><MentorsPage /></ProtectedRoute>} />
            <Route path="/student/connections" element={<ProtectedRoute requiredRole="student"><StudentConnectionsPage /></ProtectedRoute>} />
            <Route path="/student/chat/:connectionId" element={<ProtectedRoute requiredRole="student"><StudentChatPage /></ProtectedRoute>} />
            <Route path="/student/knowledge-hub" element={<ProtectedRoute requiredRole="student"><KnowledgeHubPage /></ProtectedRoute>} />
            <Route path="/student/feed" element={<ProtectedRoute requiredRole="student"><BlogFeedPage /></ProtectedRoute>} />
            {/* Alumni Routes */}
            <Route path="/alumni" element={<ProtectedRoute requiredRole="alumni"><AlumniDashboard /></ProtectedRoute>} />
            <Route path="/alumni/requests" element={<ProtectedRoute requiredRole="alumni"><RequestsPage /></ProtectedRoute>} />
            <Route path="/alumni/connections" element={<ProtectedRoute requiredRole="alumni"><AlumniConnectionsPage /></ProtectedRoute>} />
            <Route path="/alumni/chat/:connectionId" element={<ProtectedRoute requiredRole="alumni"><AlumniChatPage /></ProtectedRoute>} />
            <Route path="/alumni/blogs" element={<ProtectedRoute requiredRole="alumni"><BlogsPage /></ProtectedRoute>} />
            <Route path="/alumni/leaderboard" element={<ProtectedRoute requiredRole="alumni"><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/alumni/feed" element={<ProtectedRoute requiredRole="alumni"><BlogFeedPage /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/verify" element={<ProtectedRoute requiredRole="admin"><VerifyPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/feed" element={<ProtectedRoute requiredRole="admin"><BlogFeedPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
