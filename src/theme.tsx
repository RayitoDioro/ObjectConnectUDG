import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      blue: "#0b2c5d",   // azul institucional UDG
      yellow: "#f9b233", // dorado institucional UDG
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50", // fondo base claro
        color: "gray.800",
      },
    },
  },
});

export default theme;