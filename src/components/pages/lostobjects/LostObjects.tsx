import { useState, useEffect, useMemo } from 'react';
import { 
  Box, SimpleGrid, Heading, Text, Container, VStack, 
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, 
  DrawerCloseButton, DrawerHeader, DrawerBody, Button, HStack, Center,
  FormControl, FormLabel, Input, Textarea, Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@chakra-ui/icons';

// RUTAS ABSOLUTAS
import Card from '@/components/ui/Card'; 
import { useLostObjects } from '@/components/pages/lostobjects/hooks/useLostObjects';
import { useSchemas } from '@/hooks/useSchemas';
import { useSchemas as useLostObjectPageSchemas } from '@/components/pages/lostobjects/hooks/useSchemas';
import { useAuth } from '@/context/AuthContext';
import FilterSortControls from '@/components/pages/home/subComponents/FilterSortControls';

// IMPORTAMOS EL MODAL REUTILIZABLE Y SUS TIPOS
import ObjectDetailsModal, { type ExtendedCardProps } from '@/components/common/ObjectDetailsModal';
import type { CategoryDB } from '@/components/pages/home/Home'; 
import type { FullCardProps } from '@/types';

const LostObjects = () => {
  const { lostObjects, possibleMatches, getPossibleMatches } = useLostObjects(); 
  const { getCategories, getUserById } = useSchemas();
  const { createThreaForPost } = useLostObjectPageSchemas();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // ESTADOS DE FILTROS
  const [dbCategories, setDbCategories] = useState<CategoryDB[]>([]);
  const [searchObj, setSearchObj] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  const [categoryFilter, setCategoryFilter] = useState('Todas'); 
  const [titleFilter, setTitleFilter] = useState('');
  const [featuresFilter, setFeaturesFilter] = useState('');
  const [isTargetSet, setIsTargetSet] = useState(false);

  // CONTROLADORES DE VENTANAS
  const { isOpen: isGoalOpen, onOpen: onGoalOpen, onClose: onGoalClose } = useDisclosure();
  const { isOpen: isMatchesOpen, onOpen: onMatchesOpen, onClose: onMatchesClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  const [selectedObject, setSelectedObject] = useState<FullCardProps | null>(null);
  const [selectedPostUser, setSelectedPostUser] = useState<any | null>(null);

  // CORRECCIÓN ANTI-BUCLES: Arreglo vacío []
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setDbCategories(data.map((c: any) => ({ ...c, id: Number(c.id) })));
        } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, []); 

  // CORRECCIÓN ANTI-BUCLES: Dependencia estricta al userId
  useEffect(() => {
    if (selectedObject?.userId) {
        const fetchUser = async () => {
            const user = await getUserById(selectedObject.userId);
            setSelectedPostUser(user);
        };
        fetchUser();
    }
  }, [selectedObject?.userId]);

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

  const handleSetTarget = () => {
    getPossibleMatches(titleFilter, featuresFilter);
    setIsTargetSet(true);
    onGoalClose();
    onMatchesOpen();
  };

  const handleCreateChatWithUser = async (authorId: string, postId: number, currentUserId: string) => {
    const threadId = await createThreaForPost(authorId, postId, currentUserId);
    if (threadId) {
        navigate(`/chats/${threadId}`);
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

          {/* LA MAGIA DEL DISEÑO: Flex row para alinear horizontalmente */}
          <Center w="100%">
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              alignItems="flex-start" 
              justifyContent="center" 
              gap={4}
            >
              {/* Le agregamos un mt (margin-top) de 2px para emparejarlo exactamente con el botón de al lado */}
              <HStack spacing={4} mt={{ base: 0, md: "24px" }}>
                <Button leftIcon={<StarIcon />} colorScheme="blue" onClick={onGoalOpen}>
                  Establecer Objetivo
                </Button>
                {isTargetSet && (
                  <Button colorScheme="green" onClick={onMatchesOpen}>
                    Ver Matches ({possibleMatches.length})
                  </Button>
                )}
              </HStack>

              {/* Componente de Búsqueda */}
              <Box>
                <FilterSortControls
                  searchObj={searchObj} setSearchObj={setSearchObj}
                  sortBy={sortBy} setSortBy={setSortBy}
                  categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
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
                    key={post.id} cursor="pointer" transition="0.2s"
                    _hover={{ transform: 'scale(1.02)' }}
                    onClick={() => handleCardClick(post)} 
                  >
                    <Card
                      status={post.status} imageUrl={post.imageUrl}
                      altText={post.altText} title={post.title}
                      date={post.date} location={post.location}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

        </VStack>
      </Container>

      {/* DRAWERS LATERALES (Sin cambios) */}
      <Drawer placement="left" onClose={onGoalClose} isOpen={isGoalOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="#00569c">¿Qué se te perdió?</DrawerHeader>
          <DrawerBody py={6}>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel fontWeight="bold">Título del objeto</FormLabel>
                <Input placeholder="Ej: Mochila negra" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Características</FormLabel>
                <Textarea placeholder="Ej: Tenía un llavero de ajolote..." value={featuresFilter} onChange={(e) => setFeaturesFilter(e.target.value)} rows={6} />
              </FormControl>
              <Button colorScheme="blue" width="full" size="lg" onClick={handleSetTarget} isDisabled={!titleFilter || !featuresFilter}>
                Establecer objetivo
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer placement="right" onClose={onMatchesClose} isOpen={isMatchesOpen} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="green.600">Posibles coincidencias</DrawerHeader>
          <DrawerBody bg="gray.50">
            <VStack spacing={4} py={4}>
              {possibleMatches.length > 0 ? possibleMatches.map(match => (
                <Box key={match.id} width="100%" onClick={() => handleCardClick(match)}>
                  <Card {...match} />
                </Box>
              )) : (
                <Center h="200px"><Text color="gray.500">No hay matches todavía.</Text></Center>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* NUESTRO MODAL UNIVERSAL */}
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
};

export default LostObjects;