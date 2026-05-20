import { BrowserRouter, Route, Routes } from "react-router-dom";

// Layouts y paginas
import { MainLayout } from './layouts/MainLayout.tsx';
import Home from './components/pages/home/Home.tsx';
import Login from './components/pages/login/Login.tsx';
import LostObjects from './components/pages/lostobjects/LostObjects.tsx';
import FoundObjects from './components/pages/foundobjects/foundobjects.tsx';
import PublishObject from './components/pages/publishobject/PublishObject.tsx'; // 1. Importamos el nuevo componente
import Profile from './components/pages/profile/Profile.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import Chats from './components/pages/chats/Chats.tsx';
import ProfileSettings from './ProfileSettings';
import { ProtectedRouteAdmin } from './components/common/ProtectedRouteAdmin.tsx';
import { AdminDashboard } from './components/pages/admin/AdminDashboard.tsx';
import { AdminLayout } from './layouts/AdminLayout.tsx';
import { UsersTable } from './components/pages/admin/users/UsersTable.tsx';
import { RolesTable } from './components/pages/admin/roles/RolesTable';
import { PermissionsTable } from './components/pages/admin/permissions/PermissionsTable.tsx';
import { CategoriesTable } from './components/pages/admin/categories/CategoriesTable.tsx';
import { RolePermissionsTable } from './components/pages/admin/rolePermissions/RolePermissionsTable.tsx';
import MetricasML from "./pages/admin/MetricasML.tsx";
import ResetPassword from "./components/pages/reset-password/ResetPassword.tsx";

function App() {
  // Elimina el useAuth aquí, solo usa el Provider
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                {" "}
                <Home />{" "}
              </MainLayout>
            }
          />
          <Route
            path="/objetos-perdidos"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <LostObjects />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/objetos-encontrados"
            element={
              <MainLayout>
                {" "}
                <FoundObjects />{" "}
              </MainLayout>
            }
          />
          <Route
            path="/publicar-objeto"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <PublishObject />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/chats/:threadId?"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/perfil"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/perfil/:userId"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <UsersTable />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <RolesTable />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/permisos"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <PermissionsTable />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/rolePermisos"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <RolePermissionsTable />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <CategoriesTable />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <div>Gestionar Posts</div>
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/metricas"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <MetricasML />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
