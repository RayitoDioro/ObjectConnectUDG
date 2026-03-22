import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Container,
  VStack,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Button,
  HStack,
  Center,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@chakra-ui/icons';

import Card from '@/components/ui/Card';
import { useLostObjects } from './hooks/useLostObjects';
import { useSchemas } from '@/hooks/useSchemas';
import { useSchemas as useLostObjectPageSchemas } from './hooks/useSchemas';
import { useAuth } from '@/context/AuthContext';
import FilterSortControls from '@/components/pages/home/subComponents/FilterSortControls';
import ObjectDetailsModal, { type ExtendedCardProps } from '@/components/common/ObjectDetailsModal';
import type { CategoryDB } from '@/components/pages/home/Home';
import type { FullCardProps } from '@/types';

export default function LostObjects() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { lostObjects, possibleMatches, getPossibleMatches, clearSearch, isLoadingMatches, searchError } = useLostObjects();
  const { getCategories, getUserById } = useSchemas();
  const { createThreaForPost } = useLostObjectPageSchemas();

  // ESTADOS DE FILTROS Y BÚSQUEDA
  const [dbCategories, setDbCategories] = useState<CategoryDB[]>([]);
  const [searchObj, setSearchObj] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  
  // Persistencia en sessionStorage
  const [titleFilter, setTitleFilter] = useState(sessionStorage.getItem('searchTitle') || '');
  const [featuresFilter, setFeaturesFilter] = useState(sessionStorage.getItem('searchDescription') || '');
  const [isTargetSet, setIsTargetSet] = useState(!!sessionStorage.getItem('searchTitle') || !!sessionStorage.getItem('searchDescription'));

  // CONTROLADORES DE VENTANAS MODALES
  const { isOpen: isGoalOpen, onOpen: onGoalOpen, onClose: onGoalClose } = useDisclosure();
  const { isOpen: isMatchesOpen, onOpen: onMatchesOpen, onClose: onMatchesClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  const [selectedObject, setSelectedObject] = useState<FullCardProps | null>(null);
  const [selectedPostUser, setSelectedPostUser] = useState<any | null>(null);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setDbCategories(data.map((c: any) => ({ ...c, id: Number(c.id) })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Obtener usuario del objeto seleccionado
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
  }, [selectedObject?.userId]);

  // Filtrar y ordenar objetos
  const filteredObjects = useMemo(() => {
    return lostObjects
      .map(obj => {
        const foundCat = dbCategories.find(c => Number(c.id) === obj.categoryId);
        return { ...obj, category: foundCat ? foundCat.name : "Otros" };
      })
      .filter(obj => {
        const matchesSearch = obj.title.toLowerCase().includes(searchObj.toLowerCase()) ||
          obj.location.toLowerCase().includes(searchObj.toLowerCase());
        const matchesCategory = categoryFilter === 'Todas' || obj.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.rawDate || a.date).getTime();
        const dateB = new Date(b.rawDate || b.date).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [lostObjects, dbCategories, searchObj, categoryFilter, sortBy]);

  const handleCardClick = (object: FullCardProps) => {
    setSelectedObject(object);
    setSelectedPostUser(null);
    onModalOpen();
  };

  const handleSetTarget = async () => {
    await getPossibleMatches(titleFilter, featuresFilter);
    setIsTargetSet(true);
    sessionStorage.setItem('searchTitle', titleFilter);
    sessionStorage.setItem('searchDescription', featuresFilter);
    onGoalClose();
    onMatchesOpen();
  };

  const handleRemoveTargetClick = () => {
    setTitleFilter('');
    setFeaturesFilter('');
    clearSearch();
    setIsTargetSet(false);
    sessionStorage.removeItem('searchTitle');
    sessionStorage.removeItem('searchDescription');
  };

  const handleCreateChatWithUser = async (authorId: string, postId: number, currentUserId: string) => {
    const threadId = await createThreaForPost(authorId, postId, currentUserId);
    if (threadId) {
      navigate(`/chats/${threadId}`);
    } else {
      console.error("No se pudo crear el hilo de chat.");
    }
  };

  const modalObj: ExtendedCardProps | null = selectedObject ? {
    ...selectedObject,
    authorId: selectedObject.userId,
    authorName: selectedPostUser ? `${selectedPostUser.first_name} ${selectedPostUser.last_name}` : "Cargando...",
    authorAvatarUrl: selectedPostUser?.photo_profile_url || "",
    category: dbCategories.find(c => Number(c.id) === selectedObject.categoryId)?.name || "Otros",
  } as ExtendedCardProps : null;

  return (
    <Box bg="gray.50" minH="100vh" pb={12}>
      <Container maxW="container.xl" pt={8}>
        <VStack spacing={8} align="stretch">

          {/* TÍTULOS */}
          <Box textAlign="center" mb={2}>
            <Heading as="h1" size="2xl" color="#00569c" mb={4} fontWeight="bold">
              Objetos Perdidos
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Busca en la lista o establece un objetivo para encontrar coincidencias.
            </Text>
          </Box>

          {/* CONTROLES Y BÚSQUEDA */}
          <Center w="100%">
            <Flex
              direction={{ base: 'column', md: 'row' }}
              alignItems="flex-start"
              justifyContent="center"
              gap={4}
              w="100%"
            >
              <HStack spacing={4} mt={{ base: 0, md: "24px" }}>
                <Button
                  leftIcon={<StarIcon />}
                  bg="#00569c"
                  color="white"
                  isLoading={isLoadingMatches}
                  _hover={{ boxShadow: 'lg', bg: '#1A3258' }}
                  onClick={onGoalOpen}
                >
                  Establecer Objetivo
                </Button>
                {isTargetSet && (
                  <Button
                    colorScheme="green"
                    onClick={onMatchesOpen}
                  >
                    Ver Matches ({possibleMatches.length})
                  </Button>
                )}
              </HStack>

              {/* Componente de Búsqueda */}
              <Box>
                <FilterSortControls
                  searchObj={searchObj}
                  setSearchObj={setSearchObj}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categoriesList={dbCategories as any}
                />
              </Box>
            </Flex>
          </Center>

          {/* TARJETAS */}
          <Box w="100%" mt={4}>
            {filteredObjects.length === 0 ? (
              <Center py={20} bg="white" borderRadius="xl" shadow="sm">
                <Text fontSize="xl" color="gray.500">No hay objetos que coincidan.</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                {filteredObjects.map((post) => (
                  <Box
                    key={post.id}
                    cursor="pointer"
                    transition="0.2s"
                    _hover={{ transform: 'scale(1.02)' }}
                    onClick={() => handleCardClick(post)}
                  >
                    <Card
                      status={post.status}
                      imageUrl={post.imageUrl}
                      altText={post.altText}
                      title={post.title}
                      date={post.date}
                      location={post.location}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

        </VStack>
      </Container>

      {/* DRAWER: ESTABLECER OBJETIVO */}
      <Drawer placement="left" onClose={onGoalClose} isOpen={isGoalOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="#00569c">¿Qué se te perdió?</DrawerHeader>
          <DrawerBody py={6}>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel fontWeight="bold">Título del objeto</FormLabel>
                <Input
                  placeholder="Ej: Mochila negra"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Características</FormLabel>
                <Textarea
                  placeholder="Ej: Tenía un llavero de ajolote..."
                  value={featuresFilter}
                  onChange={(e) => setFeaturesFilter(e.target.value)}
                  rows={6}
                />
              </FormControl>
              <Button
                bg="#00569c"
                color="white"
                width="full"
                size="lg"
                isLoading={isLoadingMatches}
                isDisabled={!titleFilter.trim() || !featuresFilter.trim()}
                _hover={{ bg: '#1A3258' }}
                onClick={handleSetTarget}
              >
                Establecer objetivo
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* DRAWER: POSIBLES MATCHES */}
      <Drawer placement="right" onClose={onMatchesClose} isOpen={isMatchesOpen} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="green.600">
            Posibles coincidencias
            {searchError && (
              <Alert status="error" borderRadius="md" variant="subtle" mt={2}>
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Error de búsqueda</AlertTitle>
                  <AlertDescription fontSize="xs">{searchError}</AlertDescription>
                </Box>
              </Alert>
            )}
          </DrawerHeader>
          <DrawerBody bg="gray.50">
            <VStack spacing={4} py={4} align="stretch">
              {possibleMatches.length > 0 ? (
                possibleMatches.map(match => (
                  <Box key={match.id} onClick={() => handleCardClick(match)}>
                    <Card
                      status={match.status}
                      imageUrl={match.imageUrl}
                      altText={match.altText}
                      title={match.title}
                      date={match.date}
                      location={match.location}
                    />
                  </Box>
                ))
              ) : (
                <Center h="200px">
                  <Text color="gray.500">No hay matches todavía.</Text>
                </Center>
              )}
              <Button
                colorScheme="red"
                isDisabled={isLoadingMatches}
                onClick={handleRemoveTargetClick}
                mt={4}
              >
                Remover objetivo
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* MODAL UNIVERSAL DE DETALLES */}
      <ObjectDetailsModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        selectedObj={modalObj}
        currentUserId={profile?.user_id || null}
        onStartChat={(authorId) => {
          if (selectedObject && profile) {
            handleCreateChatWithUser(authorId, selectedObject.id, profile.user_id);
          }
        }}
      />
    </Box>
  );
}