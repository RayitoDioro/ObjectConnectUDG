import { useState, useEffect } from "react";
import { 
  Box, Center, Spinner, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton, 
  useDisclosure, Button, Image, Text, VStack, HStack, Flex, Avatar, Heading 
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 
import PresentationSection from './subComponents/PresentationSection';
import FilterSortControls from './subComponents/FilterSortControls';
import ObjectGrid from "./subComponents/ObjectGrid";
import { type CardProps, type Post } from "@/types"; 
import { useObjectFilter } from "./hooks/useObjectFilter";
import { useSchemas } from "@/hooks/useSchemas"; 
import { supabaseClient } from "@/supabaseClient"; 

type ExtendedCardProps = CardProps & {
  description?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorId?: string; 
  category?: string;
  rawDate?: string;
};

// Interfaz para guardar nuestras categorías
export type CategoryDB = {
  id: number;
  name: string;
};

const Home = () => {
  const navigate = useNavigate();
  const [dbObjects, setDbObjects] = useState<ExtendedCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [dbCategories, setDbCategories] = useState<CategoryDB[]>([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedObj, setSelectedObj] = useState<ExtendedCardProps | null>(null);
  
  const { getPosts } = useSchemas();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };

    const fetchObjects = async () => {
      try {
        setLoading(true);

        let fetchedCategories: CategoryDB[] = [];
        const { data: catData, error: catError } = await supabaseClient
          .from('categories')
          .select('id, name');
          
        if (!catError && catData) {
          fetchedCategories = catData;
          setDbCategories(catData); 
        }

        const rawPosts: Post[] = await getPosts();
        const userIds = [...new Set(rawPosts.map(post => post.user_id))];
        let profilesData: any[] = [];

        if (userIds.length > 0) {
          const { data, error } = await supabaseClient
            .from('user_profile')
            .select('user_id, first_name, last_name, photo_profile_url')
            .in('user_id', userIds); 
            
          if (!error && data) {
            profilesData = data;
          }
        }

        const getCategoryName = (id: number | null | undefined) => {
          if (!id) return "Otros";
          const foundCat = fetchedCategories.find(c => c.id === id);
          return foundCat ? foundCat.name : "Otros";
        };

        const formattedObjects: ExtendedCardProps[] = rawPosts.map((post) => {
          const authorProfile = profilesData.find(p => p.user_id === post.user_id);
          
          return {
            id: post.id,
            status: post.post_state_id === 1 ? "lost" : "found",
            imageUrl: post.photo_url || "",
            altText: post.title,
            title: post.title,
            date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
            rawDate: post.date_was_found || post.created_at,
            location: post.location || "Sin ubicación",
            description: post.description || "Sin descripción proporcionada.",
            
            category: getCategoryName((post as any).product_category_id),
            
            authorName: authorProfile ? `${authorProfile.first_name} ${authorProfile.last_name}` : "Usuario Anónimo",
            authorAvatarUrl: authorProfile ? authorProfile.photo_profile_url : "", 
            authorId: post.user_id,
          };
        });

        setDbObjects(formattedObjects);
      } catch (error) {
        console.error("Error cargando objetos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession(); 
    fetchObjects();
  }, []); 

  const {
    searchObj, setSearchObj,
    sortBy, setSortBy,
    categoryFilter, setCategoryFilter,
    filteredObjects
  } = useObjectFilter(dbObjects); 
  
  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');

  const handleOpenModal = (obj: ExtendedCardProps) => {
    setSelectedObj(obj);
    onOpen();
  };

  const handleStartChat = () => {
    if (selectedObj?.authorId) {
      navigate(`/chats?user=${selectedObj.authorId}`);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh">
        <PresentationSection />
        <Center py={20}>
          <Spinner size="xl" color="brand.blue" thickness="4px" />
        </Center>
      </Box>
    );
  }

  return(
    <Box>
      <PresentationSection/>

      <FilterSortControls
        searchObj={searchObj}
        setSearchObj={setSearchObj}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoriesList={dbCategories} 
      />

      <ObjectGrid
        lostItems={lostItems}
        foundItems={foundItems}
        searchObj={searchObj}
        onCardClick={handleOpenModal as any} 
      />

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter='blur(5px)' bg='blackAlpha.600' />
        <ModalContent borderRadius="xl" p={2}>
          <ModalHeader fontSize="lg" color="gray.700">Más información</ModalHeader>
          <ModalCloseButton mt={3} mr={3} />
          <ModalBody>
            <VStack align="stretch" spacing={5}>
              <Flex justify="space-between" align="center" borderBottom="1px solid #eee" pb={3}>
                <HStack spacing={3}>
                  <Avatar size="sm" src={selectedObj?.authorAvatarUrl} name={selectedObj?.authorName} />
                  <Text fontWeight="bold" fontSize="md" color="gray.800">{selectedObj?.authorName}</Text>
                </HStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color="gray.500">{selectedObj?.date}</Text>
                  <Text fontSize="xs" color="gray.500">{selectedObj?.location}</Text>
                </VStack>
              </Flex>
              <Heading size="md" color="#002855">{selectedObj?.title}</Heading>
              
              {/* categoría en el modal */}
              {selectedObj?.category && (
                <Text fontSize="sm" color="brand.blueLight" fontWeight="semibold">
                  Categoría: {selectedObj.category}
                </Text>
              )}

              <Center w="100%" bg="gray.100" borderRadius="md" p={4}>
                <Image src={selectedObj?.imageUrl} alt={selectedObj?.altText} maxH="280px" objectFit="contain" fallbackSrc="https://via.placeholder.com/400x300?text=Sin+Imagen" borderRadius="sm" />
              </Center>
              <Box>
                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall">{selectedObj?.description}</Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            {selectedObj?.authorId !== currentUserId ? (
              <Button colorScheme="blue" w="full" size="lg" borderRadius="md" onClick={handleStartChat}>
                Crear chat con {selectedObj?.authorName?.split(' ')[0] || "el usuario"}
              </Button>
            ) : (
              <Text w="full" textAlign="center" fontSize="sm" color="gray.500" fontStyle="italic">Esta es tu publicación.</Text>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Home;