import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { MainLayout } from './layouts/MainLayout.tsx';
import Home from './components/pages/home/Home.tsx'
import Login from './components/pages/login/Login.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            } 
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

