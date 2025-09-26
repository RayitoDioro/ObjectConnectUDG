import Card from '../../ui/Card'; // Usamos el nuevo componente Card
import { Box, Text, Heading, Flex, SimpleGrid, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import rectoriaUDG from '@/assets/rectoriaUDG.webp';
import { useState, useEffect } from 'react';

type CardProps = {
  id: number;
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  location: string;
};

const objetos: CardProps[] = [
  {
    id: 1,
    status: "lost",
    imageUrl: "",
    altText: "Mochila Negra",
    title: "Mochila Negra en CUCEI",
    date: "15/May/2024",
    location: "Edificio A",
  },
  {
    id: 2,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 3,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 4,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 5,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 6,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 7,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 8,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  },
  {
    id: 9,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 10,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  },
  {
    id: 11,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 12,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  }
];

const Home = () => {
  const [searchObj, setSearchObj] = useState('');
  const [filteredObjects, setFilteredObjects] = useState(objetos);

  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if(searchObj === '') {
        setFilteredObjects(objetos);
      } else {
        const lowercasedFilter = searchObj.toLowerCase();
        const newFilteredObjects = objetos.filter(obj => 
          obj.title.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredObjects(newFilteredObjects);
      }
    }, 600);
    return () => clearTimeout(debounceTimer);
  }, [searchObj]);

  return(
    <Box>
      {/* Hero */}
      <Box 
        textAlign={"center"} 
        py={{ base: "16", md: "20"}}
        color={"white"}
        bgImage={`linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${rectoriaUDG})`}
        bgSize={"cover"}
        bgPosition={"center"}
      >
        <Text fontSize={"lg"}>Plataforma Oficial</Text>
        <Heading size={"xl"}>Objetos Perdidos y Encontrados UDG</Heading>
        <Text mt={2}>Encuentra o reporta objetos perdidos en la comunidad universitaria.</Text>
      </Box>

      {/* {Barra de búsqueda} */}
      <Box
        w={{ base: '95%', md: '700px' }} // 1. Limita el ancho del contenedor
        mx="auto"                       // 2. CENTRA el contenedor en la página
        my="6"                          // 3. Añade margen vertical para separarlo
        p="3"                           // Padding para que el input no toque los bordes
        bg="white"
        borderRadius="lg"
        shadow="2xl"
      >
        <InputGroup size={"lg"}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input 
            type="text" 
            borderRadius={"md"} 
            placeholder="Buscar objeto..."
            value={searchObj}
            onChange={(e) => setSearchObj(e.target.value)}
          />
        </InputGroup>
      </Box>

      {/* Objetos */}
      <Flex justify="space-around" p={10} wrap="wrap" gap={8}>
        {/* Perdidos */}      
        <Box flex="1" minW="300px">
          <Heading textAlign={"center"} size="lg" mb={4} color={"#00569c"}>
            OBJETOS PERDIDOS
          </Heading>
          { //Mensajes según objetos pérdidos existentes/coincidentes
            lostItems.length === 0 ? (
              searchObj ? (
                <Text textAlign="center" mt="4" color="gray.500">
                  No hay objetos perdidos que coincidan con tu búsqueda.
                </Text>
              ) : (
                <Text textAlign="center" mt="4" color="gray.500">
                  Actualmente no hay objetos perdidos para mostrar.
                </Text>
              )
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {lostItems.map((obj) => (
                  <Card key={obj.id} {...obj} />
                ))}
              </SimpleGrid>
            )
          }
        </Box>

        {/* Encontrados */}
        <Box flex={1} minW={"300px"}>
          <Heading textAlign={"center"} size={"lg"} mb={4} color={"#00569c"}>
            OBJETOS ENCONTRADOS
          </Heading>
          { //Mensajes según objetos encontrados existentes/coincidentes
            foundItems.length === 0 ? (
              searchObj ? (
                <Text textAlign="center" mt="4" color="gray.500">
                  No hay objetos encontrados que coincidan con tu búsqueda.
                </Text>
              ) : (
                <Text textAlign="center" mt="4" color="gray.500">
                  Actualmente no hay objetos encontrados para mostrar.
                </Text>
              )
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {foundItems.map((obj) => (
                  <Card key={obj.id} {...obj} />
                ))}
              </SimpleGrid>
            )
          }
        </Box>
      </Flex>
    </Box>
  );
}

export default Home;