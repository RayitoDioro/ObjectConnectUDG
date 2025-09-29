import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Layouts y paginas
import { MainLayout } from './layouts/MainLayout.tsx';
import Home from './components/pages/home/Home.tsx'
import Login from './components/pages/login/Login.tsx';
import LostObjects from './components/pages/lostobjects/LostObjects.tsx';
import FoundObjects from './components/pages/foundobjects/foundobjects.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          } 
        />
        <Route
          path="/lost-objects"
          element={
            <MainLayout>
              <LostObjects />
            </MainLayout>
          }
        />
        {/*nueva ruta para objetos encontrados */}
        <Route
          path="/objetos-encontrados"
          element={
            <MainLayout>
              <FoundObjects/>
            </MainLayout>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;