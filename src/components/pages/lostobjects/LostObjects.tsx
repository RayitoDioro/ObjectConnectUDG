import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useLostObjects } from './hooks/useLostObjects';
import type { FullCardProps, Category } from '../../../types'; // Corregido para que apunte a la ruta correcta
import { ObjectList } from './subComponents/ObjectList';
import { useAuth } from '@/context/AuthContext';
import { useSchemas as useLostObjectPageSchemas } from './hooks/useSchemas';
import { useSchemas } from '@/hooks/useSchemas';
import { useNavigate, Link as RouterLink } from 'react-router-dom';



export default function LostObjects() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { createThreaForPost } = useLostObjectPageSchemas();
    const { getUserById, getCategories } = useSchemas();
    const { lostObjects, possibleMatches, getPossibleMatches, clearSearch, isLoadingMatches } = useLostObjects();

    // Estado para guardar el objeto seleccionado y mostrar sus detalles
    const [selectedObject, setSelectedObject] = useState<FullCardProps | null>(
        lostObjects[0] ?? null
    );
    const [selectedPostUser, setSelectedPostUser] = useState<any | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, [getCategories]);

    useEffect(() => {
        if (selectedObject?.userId) {
            const fetchUser = async () => {
                try {
                    const user = await getUserById(selectedObject.userId);
                    setSelectedPostUser(user);
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setSelectedPostUser(null);
                }
            };
            fetchUser();
        } else {
            setSelectedPostUser(null);
        }
    }, [selectedObject, getUserById]);

    // Estado para los filtros (aún no implementada la lógica de filtrado)
    const [titleFilter, setTitleFilter] = useState(sessionStorage.getItem('searchTitle') || '');
    const [featuresFilter, setFeaturesFilter] = useState(sessionStorage.getItem('searchDescription') || '');

    // Estado para controlar si ya se ha establecido un objetivo
    const [isTargetSet, setIsTargetSet] = useState(!!sessionStorage.getItem('searchTitle') || !!sessionStorage.getItem('searchDescription'));

    const { isOpen, onOpen, onClose } = useDisclosure()
    const handleCardClick = (object: FullCardProps) => {
        setSelectedObject(object);
        // Solo abre el Drawer si la columna de detalles NO está visible (en móvil/tablet)
        onOpen();
    };

    const handleTargetObjectFormClick = async (title: string, features: string) => {
        await getPossibleMatches(title, features);
        setIsTargetSet(true);
    }

    const handleRemoveTargetClick = () => {
        setTitleFilter('');
        setFeaturesFilter('');
        clearSearch();
        setIsTargetSet(false);
    }

    const handleCreateChatWithUser = async (finderId: string, postId: number, objectOwnerId: string) => {
        // Lógica para crear un chat con el usuario dado su ID
        console.log(`Creating chat with user ID: ${finderId} on post ID: ${postId} from object owner ID: ${objectOwnerId}`);
        const threadId = await createThreaForPost(finderId, postId, objectOwnerId);
        if (threadId) {
            navigate(`/chats/${threadId}`);
        } else {
            // Manejar el error, mostrar un mensaje al usuario
            console.error("No se pudo crear el hilo de chat.");
        }
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
                            isLoading={isLoadingMatches}
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
                            <VStack spacing={5} align="stretch">
                                {/* 1. Información del usuario y metadata */}
                                {selectedPostUser && (
                                    <Flex justify="space-between" align="center">
                                        <RouterLink to={`/perfil/${selectedObject.userId}`} onClick={onClose}>
                                            <Flex align="center" p={2} borderRadius="md" _hover={{ bg: 'gray.100', cursor: 'pointer' }}>
                                                <Avatar size="sm" src={selectedPostUser.photo_profile_url} name={`${selectedPostUser.first_name} ${selectedPostUser.last_name}`} />
                                                <Text ml={3} fontWeight="bold" color="gray.700">{`${selectedPostUser.first_name} ${selectedPostUser.last_name}`}</Text>
                                            </Flex>
                                        </RouterLink>
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

                                {/* 4. Nombre de la categoría */}
                                <Text textAlign="right" fontSize="sm" color="gray.600">
                                    {categories.find(cat => cat.id === selectedObject.categoryId)?.name || 'Sin categoría'}
                                </Text>

                                <Divider />

                                {/* 4. Descripción */}
                                <Text>{selectedObject.description}</Text>

                                {/* 5. Acciones de Contacto */}
                                {selectedPostUser && profile && selectedObject.userId !== profile.user_id && (
                                    <VStack spacing={2} align="stretch" pt={4}>
                                        <Button
                                            colorScheme="brand"
                                            bg="brand.blueLight"
                                            color="white"
                                            _hover={{ bg: 'brand.blue' }}
                                            onClick={() => handleCreateChatWithUser(selectedPostUser.user_id, selectedObject.id, profile!.user_id)}
                                        >
                                            {`Crear chat con ${selectedPostUser.first_name} ${selectedPostUser.last_name}`}
                                        </Button>
                                    </VStack>
                                )}
                            </VStack>
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
