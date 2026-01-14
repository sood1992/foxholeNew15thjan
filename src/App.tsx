import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout';
import ErrorBoundary from './components/ErrorBoundary';
import {
  Login,
  Dashboard,
  KanbanBoard,
  Projects,
  ProductionCalendar,
  CapacityHeatmap,
  TeamROI,
  Leaderboard,
  Team,
  ClientPortal,
  Settings,
} from './pages';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Routes component (needs to be inside AppProvider)
function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/calendar" element={<ProductionCalendar />} />
        <Route path="/heatmap" element={<CapacityHeatmap />} />
        <Route path="/roi" element={<TeamROI />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/team" element={<Team />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
