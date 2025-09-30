// src/theme.tsx
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    // 1. Fusionamos todos los colores en el mismo objeto 'brand'
    brand: {

      // --- Tus colores institucionales originales ---
      blue: "#0b2c5d",   // azul institucional UDG
      blueTwo: "#004e8eff",
      blueLight: "#00569c",
      yellow: "#f9b233", // dorado institucional UDG
      yellowTwo: "#d6982eff", // dorado institucional UDG

      // --- Nuevos colores para el formulario ---
      primary: "#0A1C3B",     // --primary-blue
      secondary: "#1A3E7B",   // --secondary-blue
      udgRed: "#A30000",      // --udg-red
      orangeFound: "#F7B500", // --orange-found
      lightGray: "#F0F2F5",   // --light-gray
      mediumGray: "#D1D5DB",  // --medium-gray
      darkGrayText: "#374151", // --dark-gray-text
    },
  },
  styles: {
    // 2. Mantenemos tus estilos globales intactos
    global: {
      body: {
        bg: "gray.50", // fondo base claro
        color: "gray.800",
      },
    },
  },
});

export default theme;