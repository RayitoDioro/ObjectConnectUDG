import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  Image,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { AttachmentIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSchemas, type PostPayload } from "../../../hooks/useSchemas";
import type { AlertMessage, Category } from "@/types";

const PublishObject = () => {
  // 2. Estado para guardar los archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 3. Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { session } = useAuth();
  const { uploadPostWithImage, getCategories } = useSchemas();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data) setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showAlert("error", "Error", "No se pudieron cargar las categorías.");
      }
    };
    fetchCategories();
  }, []);

  // Función para mostrar alertas
  const showAlert = (type: "success" | "error", title: string, description: string) => {
    setAlertMessage({ type, title, description });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Función que se ejecuta cuando el usuario selecciona archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log('Archivos seleccionados:', event.target.files);
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      const message = newFiles.length > 1 ? `${newFiles.length} fotos agregadas correctamente.` : `${newFiles.length} foto agregada correctamente.`;
      showAlert("success", "Fotos agregadas", message);
    }
  };

  // Función para eliminar una foto
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para abrir el selector de archivos al hacer clic en el área
  const handleUploadBoxClick = () => {
    fileInputRef.current?.click();
  };


  // submit del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // Limpiar errores previos

    if (!session) {
      console.warn('No hay sesión activa.');
      return;
    }

    const userId = session.user.id;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const categoryId = formData.get('category');

    const data: PostPayload = {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      product_category_id: categoryId ? Number(categoryId) : undefined,
      foundWhere: String(formData.get('foundWhere') || '') || undefined,
      dateFound: String(formData.get('dateFound') || '') || null,
    };

    // Validaciones
    const newErrors: Record<string, string> = {};
    if (!data.title) newErrors.title = "El título es obligatorio.";
    if (!data.description) newErrors.description = "La descripción es obligatoria.";
    if (!data.product_category_id) newErrors.category = "La categoría es obligatoria.";
    if (!data.foundWhere) newErrors.foundWhere = "El lugar donde lo encontraste es obligatorio.";
    if (!data.dateFound) {
      newErrors.dateFound = "La fecha es obligatoria.";
    } else {
      const year = new Date(data.dateFound).getFullYear();
      if (year < new Date().getFullYear()) {
        newErrors.dateFound = "La fecha debe ser del año presente en adelante.";
      }
    }
    if (selectedFiles.length === 0) {
      newErrors.photos = "Debes subir al menos una foto.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }


    console.log('Publicar objeto - userId:', userId);
    console.log('Datos del formulario:', data);
    console.log('Archivos seleccionados:', selectedFiles);

    setIsSubmitting(true);
    try {
      // subir la primera imagen (si existe) y crear el post
      const fileToUpload = selectedFiles[0];
      const created = await uploadPostWithImage(userId, data, fileToUpload);
      console.log('Post creado:', created);

      // limpiar estado y formulario
      setSelectedFiles([]);
      form.reset();
      showAlert("success", "¡Éxito!", "Tu objeto ha sido publicado correctamente.");
      
    } catch (error) {
      console.error('Error creando post:', error);
      showAlert("error", "Error", "Hubo un problema al publicar tu objeto. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para limpiar los archivos seleccionados
  const handleClearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container
      maxW="900px"
      my={8}
      p={0}
      bg="white"
      borderRadius="lg"
      boxShadow="lg"
      overflow="hidden"
    >
      <Flex
        bg="brand.orangeFound"
        color="brand.primary"
        p={8}
        align="center"
        position="relative"
      >
        <Box zIndex={1}>
          <Heading as="h1" size="xl">
            ¡AYÚDANOS A ENCONTRARLO!
          </Heading>
          <Text fontSize="lg" mt={1}>
            ¿Se te perdió o encontraste algo?
          </Text>
          <Text fontSize="lg" mt={1}>
            Publica tu objeto para encontrarlo o a su dueño.
          </Text>
        </Box>
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w="250px"
          bg="brand.primary"
          sx={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
      </Flex>

      <Box p={{ base: 6, md: 10 }}>
        {/* Agregar onSubmit al formulario */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="lg"
                color="brand.primary"
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.lightGray"
              >
                Información Principal
              </Heading>
              <VStack spacing={5} mt={6}>
                {/* ... (resto de los FormControl no cambian) ... */}
                <FormControl isRequired isInvalid={!!errors.title}>
                  <FormLabel fontWeight="600">Título del Reporte</FormLabel>
                  <Input
                    name="title"
                    placeholder="Ej. Mochila negra en Biblioteca"
                  />
                  {errors.title && (
                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.description}>
                  <FormLabel fontWeight="600">Descripción Detallada</FormLabel>
                  <Textarea
                    name="description"
                    placeholder="Marca, color, contenido especial, señas particulares..."
                    minH="100px"
                  />
                  {errors.description && (
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  )}
                </FormControl>
              </VStack>
            </Box>

            <Box>
              <Heading
                as="h2"
                size="lg"
                color="brand.primary"
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.lightGray"
              >
                Detalles Clave
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={6}>
                {/* ... (resto de los FormControl no cambian) ... */}
                <FormControl isRequired isInvalid={!!errors.category}>
                  <FormLabel fontWeight="600">Categoría</FormLabel>
                  <Select name="category" placeholder="Selecciona una categoría">
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.foundWhere}>
                  <FormLabel fontWeight="600">¿Dónde lo encontraste?</FormLabel>
                  <Input
                    name="foundWhere"
                    placeholder="Ej. CUCEI, Edificio G, Aula 205"
                  />
                  {errors.foundWhere && (
                    <FormErrorMessage>{errors.foundWhere}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.dateFound}>
                  <FormLabel fontWeight="600">
                    Fecha en que lo encontraste
                  </FormLabel>
                  <Input name="dateFound" type="date" />
                  {errors.dateFound && (
                    <FormErrorMessage>{errors.dateFound}</FormErrorMessage>
                  )}
                </FormControl>
              </SimpleGrid>
            </Box>

            <Box>
              <Heading
                as="h2"
                size="lg"
                color="brand.primary"
                pb={2}
                borderBottom="2px solid"
                borderColor="brand.lightGray"
              >
                Sube una Fotografía
              </Heading>
              {errors.photos && (
                <Text color="red.500" mt={2}>
                  {errors.photos}
                </Text>
              )}

              {/* 6. Lógica condicional: Muestra la vista previa si hay archivos, o la caja de carga si no los hay. */}
              {selectedFiles.length > 0 ? (
                <Box mt={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                      {selectedFiles.length} foto
                      {selectedFiles.length !== 1 ? "s" : ""} seleccionada
                      {selectedFiles.length !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={handleClearFiles}
                    >
                      Limpiar todas
                    </Button>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        position="relative"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="md"
                        transition="all 0.2s"
                      >
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Vista previa ${index + 1}`}
                          w="100%"
                          h="120px"
                          objectFit="cover"
                        />
                        <Button
                          position="absolute"
                          top={1}
                          right={1}
                          size="sm"
                          colorScheme="red"
                          variant="solid"
                          rounded="full"
                          p={0}
                          w="28px"
                          h="28px"
                          onClick={() => {
                            handleRemoveFile(index);
                            if(selectedFiles.length === 1) {
                              handleClearFiles();
                            }
                          }}
                          _hover={{ transform: "scale(1.1)" }}
                        >
                          <DeleteIcon w={3} h={3} />
                        </Button>
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Button
                    mt={4}
                    variant="outline"
                    colorScheme="blue"
                    onClick={handleUploadBoxClick}
                    size="sm"
                  >
                    + Agregar más fotos
                  </Button>
                </Box>
              ) : (
                <VStack
                  mt={6}
                  border="2px dashed"
                  borderColor="brand.mediumGray"
                  borderRadius="lg"
                  p={10}
                  spacing={4}
                  bg="brand.lightGray"
                  cursor="pointer"
                  onClick={handleUploadBoxClick}
                  transition="all 0.3s"
                  _hover={{
                    borderColor: "brand.primary",
                    bg: "blue.50",
                  }}
                >
                  <AttachmentIcon
                    w={12}
                    h={12}
                    color="brand.primary"
                    opacity={0.7}
                  />
                  <VStack spacing={1}>
                    <Text fontWeight="600" fontSize="md" color="gray.700">
                      Arrastra tus fotos aquí
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      o haz click para seleccionar
                    </Text>
                  </VStack>
                </VStack>
              )}

              <Input
                name="photos"
                type="file"
                multiple
                accept="image/*"
                display="none"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Box>

            {alertMessage && (
              <Alert status={alertMessage.type} mb={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>{alertMessage.title}</AlertTitle>
                  <AlertDescription>{alertMessage.description}</AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Botones */}
            <HStack spacing={4} mt={5} justify="flex-end">
              <Button
                variant="outline"
                type="button"
                colorScheme="gray"
                onClick={() => {
                  handleClearFiles();
                  document.querySelector("form")?.reset();
                }}
              >
                Cancelar
              </Button>
              <Button
                bg="brand.primary"
                color="white"
                _hover={{
                  bg: "brand.secondary",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                _active={{ transform: "translateY(0)" }}
                type="submit"
                isLoading={isSubmitting}
                fontWeight="600"
                px={8}
                transition="all 0.2s"
              >
                PUBLICAR OBJETO
              </Button>
            </HStack>

          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default PublishObject;