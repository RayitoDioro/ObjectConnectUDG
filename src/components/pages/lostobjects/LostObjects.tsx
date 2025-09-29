import { useState } from 'react';
import {
    Box,
    Grid,
    GridItem,
    VStack,
    Input,
    Button,
    Heading,
    Textarea, FormControl,
    FormLabel, useDisclosure, Flex,
    Avatar,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Divider,
    Text,
    Image,
    Link as ChakraLink
} from '@chakra-ui/react';
import { useLostObjects } from './hooks/useLostObjects';
import { users } from './data/users'; // Importamos los datos de los usuarios
import type { FullCardProps } from '../../../types'; // Corregido para que apunte a la ruta correcta
import { ObjectList } from './subComponents/ObjectList';



export default function LostObjects() {
    const { lostObjects, possibleMatches, getPossibleMatches } = useLostObjects();

    // Estado para guardar el objeto seleccionado y mostrar sus detalles
    const [selectedObject, setSelectedObject] = useState<FullCardProps | null>(
        lostObjects[0] ?? null
    );

    // Estado para los filtros (aún no implementada la lógica de filtrado)
    const [titleFilter, setTitleFilter] = useState('');
    const [featuresFilter, setFeaturesFilter] = useState('');

    // Estado para controlar si ya se ha establecido un objetivo
    const [isTargetSet, setIsTargetSet] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure()
    const handleCardClick = (object: FullCardProps) => {
        setSelectedObject(object);
        // Solo abre el Drawer si la columna de detalles NO está visible (en móvil/tablet)
        onOpen();
    };

    const handleTargetObjectFormClick = (title: string, features: string) => {
        getPossibleMatches(title, features);
        setIsTargetSet(true);
    }

    const handleRemoveTargetClick = () => {
        setTitleFilter('');
        setFeaturesFilter('');
        getPossibleMatches('', ''); // Call with empty strings to clear the matches
        setIsTargetSet(false);
    }

    return (
        <Grid
            templateColumns={{ base: '1fr', lg: '300px 1fr 1.2fr' }}
            gap={6}
            p={{ base: 4, md: 6 }}
            minH="calc(100vh - 160px)" // Adjust the height to fill the screen minus header/footer
        >
            {/* Columna 1: Objeto Objetivo */}
            <GridItem as="aside">
                <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                    <VStack spacing={4} align="stretch">
                        <Heading as="h3" size="md" textAlign="center" fontWeight="normal" color="gray.600">
                            ¿Se te perdió algo?
                        </Heading>
                        <FormControl>
                            <FormLabel htmlFor="title-filter" fontSize="sm">Título del objeto</FormLabel>
                            <Input
                                id="title-filter"
                                placeholder="Ej: Mochila negra"
                                value={titleFilter}
                                onChange={(e) => setTitleFilter(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="features-filter" fontSize="sm">Características</FormLabel>
                            <Textarea
                                id="features-filter"
                                placeholder="Ej: Tenía un llavero de ajolote..."
                                value={featuresFilter}
                                onChange={(e) => setFeaturesFilter(e.target.value)}
                            />
                        </FormControl>
                        <Button
                            bg="#00569c" 
                            color="white"
                            _hover={{
                                boxShadow: 'lg',
                                bg: '#1A3258' 
                            }}
                            isDisabled={isTargetSet || !titleFilter || !featuresFilter}
                            onClick={() => handleTargetObjectFormClick(titleFilter, featuresFilter)}
                        >
                            Establecer objetivo
                        </Button>
                        <Button
                            colorScheme="red" 
                            isDisabled={!isTargetSet}
                            onClick={handleRemoveTargetClick}
                        >
                            Remover objetivo
                        </Button>
                    </VStack>
                </Box>
            </GridItem>

            {/* Columna 2: Lista de Objetos */}
            <GridItem as="section" overflowY="auto" maxH="calc(100vh - 200px)">
                <ObjectList
                    title="Todos los objetos"
                    items={lostObjects}
                    emptyListMessage="No hay objetos perdidos registrados"
                    onCardClick={handleCardClick}
                    selectedObjectId={selectedObject?.id ?? null}
                />
            </GridItem>

            {/* Columna 3: Detalles del Objeto */}
            <GridItem as="article">
                <ObjectList
                    title="Posibles matches"
                    items={possibleMatches}
                    emptyListMessage="No hay match o establece un nuevo objetivo"
                    onCardClick={handleCardClick}
                    selectedObjectId={selectedObject?.id ?? null}
                />
            </GridItem>

            <Drawer onClose={onClose} isOpen={isOpen} size={"md"}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Más información</DrawerHeader>
                    <DrawerBody>
                        {selectedObject ? (
                            (() => {
                                const user = users.find(u => u.id === selectedObject.userId);
                                return (
                                    <VStack spacing={5} align="stretch">
                                        {/* 1. Información del usuario y metadata */}
                                        {user && (
                                            <Flex justify="space-between" align="center">
                                                <Flex align="center">
                                                    <Avatar size="sm" src={user.photoUrl} name={user.fullName} />
                                                    <Text ml={3} fontWeight="bold" color="gray.700">{user.fullName}</Text>
                                                </Flex> 
                                                <Text fontSize="xs" color="gray.500" textAlign="right">
                                                    {selectedObject.date},<br />{selectedObject.location}
                                                </Text>
                                            </Flex>
                                        )}

                                        {/* 2. Título del objeto */}
                                        <Heading as="h2" size="lg" color="brand.blue">
                                            {selectedObject.title}
                                        </Heading>

                                        {/* 3. Imagen del objeto */}
                                        <Image src={selectedObject.imageUrl} alt={selectedObject.altText} borderRadius="md" maxH="300px" w="100%" objectFit="contain" bg="gray.100" /> 

                                        <Divider />

                                        {/* 4. Descripción */}
                                        <Text>{selectedObject.description}</Text>

                                        {/* 5. Acciones de Contacto */}
                                        {user && (
                                            <VStack spacing={2} align="stretch" pt={4}>
                                                <Button colorScheme="brand" bg="brand.blueLight" color="white" _hover={{ bg: 'brand.blue' }}>
                                                    Crear chat con {user.fullName}
                                                </Button>
                                                <Text textAlign="center" fontSize="xs" color="gray.500">
                                                    o envíale un correo a <ChakraLink href={`mailto:${user.email}`} isExternal color="brand.blue">{user.email}</ChakraLink>
                                                </Text>
                                            </VStack>
                                        )}
                                    </VStack>
                                );
                            })()
                        ) : (
                            <Flex align="center" justify="center" h="100%">
                                <Text color="gray.500">Selecciona un objeto para ver los detalles.</Text>
                            </Flex>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Grid>
    );
}
