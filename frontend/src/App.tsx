import { BrowserRouter } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import AppRoutes from '@/routes';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore.enhanced';

function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Chỉ initialize 1 lần khi component mount
    if (!isInitialized) {
      initializeAuth();
    }
  }, []); // Empty dependency array để chỉ chạy 1 lần

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AppProviders>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
