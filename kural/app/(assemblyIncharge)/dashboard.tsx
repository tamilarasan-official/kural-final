import Dashboard from '../components/Dashboard';
import ScreenWrapper from '../components/ScreenWrapper';

export default function AssemblyInchargeDashboard() {
  return (
    <ScreenWrapper userRole="moderator">
      <Dashboard roleOverride="moderator" />
    </ScreenWrapper>
  );
}