import { Box, Heading, SimpleGrid } from "@chakra-ui/react";

import Card from "../../ui/Card.tsx";
import { lostobjects } from "../lostobjects/data/lostobjects.ts";

const FoundObjects = () => {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={10}>
        Objetos Encontrados
      </Heading>
      
      {/* Usamos SimpleGrid para mostrar las tarjetas en una cuadrícula */}
      <SimpleGrid columns={{ sm: 1, md: 2, lg: 4 }} spacing={8}>
        {/* Mapeamos los datos de ejemplo para renderizar cada tarjeta */}
        {lostobjects.map((item) => (
          <Card
            key={item.id}
            status="found" // El detalle clave: marcamos el estado como 'encontrado'
            imageUrl={item.imageUrl}
            altText={item.title}
            title={item.title}
            date={item.date}
            location={item.location}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default FoundObjects;