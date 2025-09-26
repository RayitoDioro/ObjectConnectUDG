import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Corregimos las rutas para que sean relativas a la ubicación de App.tsx
// y usamos la importación nombrada { MainLayout } con llaves.
// Añadimos la extensión .tsx para ser más explícitos con el importador.
import { MainLayout } from './layouts/MainLayout.tsx';
// import Home from './pages/home/Home.tsx';
// import Login from './pages/login/Login.tsx';
import Home from './components/pages/home/Home.tsx'
import Login from './components/pages/login/Login.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La ruta principal ahora usa MainLayout para envolver a Home */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          } 
        />
        {/* La ruta de login no necesita el layout principal */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

