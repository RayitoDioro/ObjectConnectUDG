import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/components/ui/provider.tsx"
import './index.css'
import App from './App.tsx'

// 1. Importaciones Adicionales
import { ChakraProvider } from '@chakra-ui/react'
import theme  from './theme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Envoltura con ChakraProvider */}
    <ChakraProvider theme={theme}>
      <Provider>
        <App />
      </Provider>
    </ChakraProvider>
  </StrictMode>,
)