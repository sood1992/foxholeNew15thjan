import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout';
import {
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

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
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
      </Router>
    </AppProvider>
  );
}

export default App;
