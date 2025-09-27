import Card from '../../ui/Card'; // Usamos el nuevo componente Card
import { Box, Text, Heading, Flex, SimpleGrid, Input, InputGroup, InputLeftElement, Select, Stack, Button, useDisclosure, Collapse } from "@chakra-ui/react";
import { SearchIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
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
    imageUrl: rectoriaUDG,
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
  const [sortBy, setSortBy] = useState('newest');
  
  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');

  const { isOpen, onToggle } = useDisclosure()
  

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // FILTRADO
      let processedObjects;

      if(searchObj === '') {
        processedObjects = objetos;
      } else {
        const lowercasedFilter = searchObj.toLowerCase();
        processedObjects = objetos.filter(obj => 
          obj.title.toLowerCase().includes(lowercasedFilter) ||
          obj.location.toLowerCase().includes(lowercasedFilter)
        );
      }

      // ORDENAMIENTO
      const sortedObjects = [...processedObjects];

      if(sortBy === 'newest') {
        sortedObjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        sortedObjects.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      setFilteredObjects(sortedObjects);      

    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchObj, sortBy]);

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

      {/* Botón para mostrar barra y filtros */}
      <Box textAlign='center' my='6'>
        <Button 
          color='brand.blueLight' 
          borderColor='brand.blueLight' 
          _hover={{ bg: 'brand.blueLight', color: 'white'}} 
          variant='outline' 
          leftIcon={<ArrowUpDownIcon/>} 
          onClick={onToggle}
        >
          {isOpen ? 'Ocultar' : 'Buscar o Filtrar'}
        </Button>
      </Box>

      {/* Panel que contiene la barra de búsqueda y filtros */}
      <Collapse in={isOpen} animateOpacity>
          <Box
            w={{ base: '95%', md: '900px'}}
            mx='auto'
            mb='4'
            p='4'
            bg='white'
            shadow='md'
          >
            <Stack spacing={4}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  type="text"
                  borderRadius="md"
                  placeholder="Buscar por título o ubicación..."
                  value={searchObj}
                  onChange={(e) => setSearchObj(e.target.value)}
                />
              </InputGroup>

              <Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Más nuevos primero</option>
                <option value="oldest">Más antiguos primero</option>
              </Select>
            </Stack>
          </Box>
        </Collapse>

      {/* Objetos */}
      <Flex justify="space-around" p={10} wrap="wrap" gap={8}>
        {/* Perdidos */}      
        <Box flex="1" minW="300px">
          <Heading textAlign={"center"} size="lg" mb={4} color={"brand.blueLight"}>
            OBJETOS PERDIDOS
          </Heading>
          { //Mensajes según objetos perdidos existentes/coincidentes
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