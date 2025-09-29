import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Layouts y paginas
import { MainLayout } from './layouts/MainLayout.tsx';
import Home from './components/pages/home/Home.tsx'
import Login from './components/pages/login/Login.tsx';
import LostObjects from './components/pages/lostobjects/LostObjects.tsx';
import FoundObjects from './components/pages/foundobjects/foundobjects.tsx';
import PublishObject from './components/pages/publishobject/PublishObject.tsx'; // 1. Importamos el nuevo componente

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
        <Route
          path="/objetos-encontrados"
          element={
            <MainLayout>
              <FoundObjects/>
            </MainLayout>
          }
        />
        {/* publicar objetos */}
        <Route
          path="/publicar-objeto"
          element={
            <MainLayout>
              <PublishObject />
            </MainLayout>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;