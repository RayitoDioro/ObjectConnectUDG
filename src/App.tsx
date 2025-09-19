import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './components/login';
import Home from './components/home';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
