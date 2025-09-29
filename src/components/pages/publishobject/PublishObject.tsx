import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  FormControl, 
  FormLabel, 
  Heading, 
  HStack, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Select, 
  SimpleGrid, 
  Text, 
  Textarea, 
  VStack,
  Image, // Importamos el componente de Imagen
  CloseButton, // Importamos un botón de cierre
} from "@chakra-ui/react";
import { AttachmentIcon, CalendarIcon } from "@chakra-ui/icons";
import { useState, useRef } from "react"; // 1. Importamos useState y useRef

const PublishObject = () => {
  // 2. Estado para guardar los archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 3. Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Función que se ejecuta cuando el usuario selecciona archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convertimos el FileList a un Array y lo guardamos en el estado
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  // 5. Función para abrir el selector de archivos al hacer clic en el área
  const handleUploadBoxClick = () => {
    fileInputRef.current?.click();
  };
  
  // Función para limpiar los archivos seleccionados
  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <Container maxW="900px" my={8} p={0} bg="white" borderRadius="lg" boxShadow="lg" overflow="hidden">
      
      <Flex 
        bg="brand.orangeFound" 
        color="brand.primary" 
        p={8} 
        align="center" 
        position="relative"
      >
        <Box zIndex={1}>
          <Heading as="h1" size="xl" fontFamily="Montserrat">¡ENCONTRADO!</Heading>
          <Text fontSize="lg" mt={1}>Publica un objeto para ayudar a su dueño.</Text>
        </Box>
        <Box 
          display={{ base: 'none', md: 'block' }}
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w="250px"
          bg="brand.primary"
          sx={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
      </Flex>
      
      <Box p={{ base: 6, md: 10 }}>
        <VStack as="form" spacing={8} align="stretch">
          <Box>
            <Heading as="h2" size="lg" fontFamily="Montserrat" color="brand.primary" pb={2} borderBottom="2px solid" borderColor="brand.lightGray">
              Información Principal
            </Heading>
            <VStack spacing={5} mt={6}>
              {/* ... (resto de los FormControl no cambian) ... */}
              <FormControl isRequired>
                <FormLabel fontWeight="600">Título del Reporte</FormLabel>
                <Input placeholder="Ej. Mochila negra en Biblioteca" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Descripción Detallada</FormLabel>
                <Textarea placeholder="Marca, color, contenido especial, señas particulares..." minH="100px" />
              </FormControl>
            </VStack>
          </Box>

          <Box>
            <Heading as="h2" size="lg" fontFamily="Montserrat" color="brand.primary" pb={2} borderBottom="2px solid" borderColor="brand.lightGray">
              Detalles Clave
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={6}>
              {/* ... (resto de los FormControl no cambian) ... */}
              <FormControl>
                <FormLabel fontWeight="600">Categoría</FormLabel>
                <Select>
                  <option>Electrónicos</option>
                  <option>Libros y Libretas</option>
                  <option>Credenciales</option>
                  <option>Ropa y Accesorios</option>
                  <option>Otros</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600">¿Dónde lo encontraste?</FormLabel>
                <Input placeholder="Ej. CUCEI, Edificio G, Aula 205" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600">¿Dónde lo entregaste?</FormLabel>
                <Input placeholder="Ej. Control Escolar, taquilla de la biblioteca..." />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Fecha en que lo encontraste</FormLabel>
                <InputGroup>
                  <Input type="date" />
                  <InputRightElement pointerEvents="none">
                    <CalendarIcon color="gray.400" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </Box>

          <Box>
            <Heading as="h2" size="lg" fontFamily="Montserrat" color="brand.primary" pb={2} borderBottom="2px solid" borderColor="brand.lightGray">
              Sube una Fotografía
            </Heading>

            {/* 6. Lógica condicional: Muestra la vista previa si hay archivos, o la caja de carga si no los hay. */}
            {selectedFiles.length > 0 ? (
              <Box mt={6}>
                <HStack spacing={4} wrap="wrap">
                  {selectedFiles.map((file, index) => (
                    <Image
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Vista previa ${index + 1}`}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  ))}
                </HStack>
                <Button onClick={handleClearFiles} size="sm" mt={4}>Limpiar selección</Button>
              </Box>
            ) : (
              <VStack 
                mt={6} 
                border="2px dashed" 
                borderColor="brand.mediumGray" 
                borderRadius="lg" p={8} 
                spacing={4} 
                bg="brand.lightGray" 
                cursor="pointer"
                onClick={handleUploadBoxClick} // 7. Conectamos el clic aquí
              >
                <AttachmentIcon w={10} h={10} color="gray.500" />
                <Text>Arrastra tus fotos aquí o haz click para seleccionarlas</Text>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  display="none" 
                  ref={fileInputRef} // 8. Conectamos la referencia
                  onChange={handleFileChange} // 9. Conectamos el manejador de cambios
                />
              </VStack>
            )}
          </Box>
          
          <Box>
            <FormControl isRequired>
              <Input type="email" placeholder="tucorreo@alumnos.udg.mx" />
            </FormControl>
            <Text fontSize="sm" color="gray.600" mt={2}>
              *Tu correo institucional (@alumnos.udg.mx) será visible para el dueño. No será visible públicamente.
            </Text>
          </Box>

          <HStack justify="flex-end" spacing={4} pt={6} borderTop="2px solid" borderColor="brand.lightGray">
            <Button variant="outline">Cancelar</Button>
            <Button bg="brand.primary" color="white" _hover={{ bg: 'brand.secondary' }} type="submit">
              PUBLICAR OBJETO ENCONTRADO
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
};

export default PublishObject;