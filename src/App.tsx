import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Layouts y paginas
import { MainLayout } from './layouts/MainLayout.tsx';
import Home from './components/pages/home/Home.tsx'
import Login from './components/pages/login/Login.tsx';
import LostObjects from './components/pages/lostobjects/LostObjects.tsx';
import FoundObjects from './components/pages/foundobjects/foundobjects.tsx';
import PublishObject from './components/pages/publishobject/PublishObject.tsx'; // 1. Importamos el nuevo componente
import Profile from './components/pages/profile/Profile.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import Chats from './components/pages/chats/Chats.tsx';

function App() {
  // Elimina el useAuth aquí, solo usa el Provider
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout> <Home /> </MainLayout>} />
          <Route
            path="/objetos-perdidos"
            element={
              <ProtectedRoute>
                <MainLayout><LostObjects /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/objetos-encontrados" element={<MainLayout> <FoundObjects/> </MainLayout>} />
          <Route
            path="/publicar-objeto"
            element={
              <ProtectedRoute>
                <MainLayout><PublishObject /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <MainLayout><Chats /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/:userId"
            element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;