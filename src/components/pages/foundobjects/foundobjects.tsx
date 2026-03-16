import { useState, useEffect, useMemo } from 'react';
import { 
  Box, SimpleGrid, Spinner, Heading, Text, Container, VStack, Center, useDisclosure 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// IMPORTACIONES Y RUTAS ABSOLUTAS
import { useSchemas } from '@/hooks/useSchemas'; 
import { useSchemas as useLostObjectPageSchemas } from '@/components/pages/lostobjects/hooks/useSchemas';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import FilterSortControls from '@/components/pages/home/subComponents/FilterSortControls';
import { supabaseClient } from "@/supabaseClient"; 

// IMPORTAMOS NUESTRO MÓDULO ESTRELLA
import ObjectDetailsModal, { type ExtendedCardProps } from '@/components/common/ObjectDetailsModal';

import type { FullCardProps, Post } from '@/types';
import type { CategoryDB } from '@/components/pages/home/Home';

const FoundObjects = () => {
  const { getPosts, getCategories } = useSchemas(); 
  const { createThreaForPost } = useLostObjectPageSchemas();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [foundPosts, setFoundPosts] = useState<FullCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA LOS FILTROS
  const [dbCategories, setDbCategories] = useState<CategoryDB[]>([]);
  const [searchObj, setSearchObj] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  const [categoryFilter, setCategoryFilter] = useState('Todas'); 

  // CONTROLADORES DEL MODAL
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedObject, setSelectedObject] = useState<FullCardProps | null>(null);

  // 1. CARGA INICIAL OPTIMIZADA Y SIN BUCLES
  useEffect(() => {
    const fetchFoundObjects = async () => {
      try {
        setLoading(true);
        
        // A. Bajamos las categorías
        const cats = await getCategories();
        setDbCategories(cats.map((c: any) => ({ ...c, id: Number(c.id) })));

        // B. Bajamos publicaciones y filtramos las encontradas
        const allPosts: Post[] = await getPosts();
        const onlyFound = allPosts.filter(post => post.post_state_id === 2);

        // C. Buscamos a los autores de estos posts en un solo viaje
        const userIds = [...new Set(onlyFound.map(post => post.user_id))];
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

        // D. Armamos las tarjetas con la información COMPLETA
        const mappedPosts: FullCardProps[] = onlyFound.map((post) => {
          const authorProfile = profilesData.find(p => p.user_id === post.user_id);

          return {
            id: post.id,
            status: 'found',
            imageUrl: post.photo_url || '',
            altText: post.title,
            title: post.title,
            date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
            rawDate: post.date_was_found || post.created_at,
            location: post.location || 'Ubicación no especificada',
            description: post.description || 'Sin descripción',
            userId: post.user_id,
            categoryId: (post as any).product_category_id, 
            authorName: authorProfile ? `${authorProfile.first_name} ${authorProfile.last_name}` : "Usuario Anónimo",
            authorAvatarUrl: authorProfile ? authorProfile.photo_profile_url : "",
          };
        });

        setFoundPosts(mappedPosts);
      } catch (error) {
        console.error("Error cargando objetos encontrados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoundObjects();
  }, []); // <--- ¡AQUÍ ESTÁ LA MAGIA! Arreglo vacío para que no haya bucle infinito.

  // Aplicar los filtros
  const filteredObjects = useMemo(() => {
    return foundPosts
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
  }, [foundPosts, dbCategories, searchObj, categoryFilter, sortBy]);

  const handleCardClick = (object: FullCardProps) => {
    setSelectedObject(object);
    onOpen();
  };

  const handleCreateChatWithUser = async (authorId: string, postId: number, currentUserId: string) => {
    const threadId = await createThreaForPost(authorId, postId, currentUserId);
    if (threadId) {
        navigate(`/chats/${threadId}`);
    }
  };

  // ADAPTADOR SÚPER LIMPIO
  const modalObj: ExtendedCardProps | null = selectedObject ? {
    ...selectedObject,
    authorId: selectedObject.userId,
    authorName: selectedObject.authorName,
    authorAvatarUrl: selectedObject.authorAvatarUrl,
    category: dbCategories.find(c => Number(c.id) === selectedObject.categoryId)?.name || "Otros",
  } as ExtendedCardProps : null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh" pb={12}>
      <Container maxW="container.xl" pt={8}>
        <VStack spacing={8} align="stretch">
          
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="2xl" color="green.600" mb={3}>
              Objetos Encontrados
            </Heading>
            <Text fontSize="lg" color="gray.600">
              ¡Estos artículos ya han regresado con sus dueños o han sido hallados!
            </Text>
          </Box>

          <Box w="100%">
            <FilterSortControls
              searchObj={searchObj} setSearchObj={setSearchObj}
              sortBy={sortBy} setSortBy={setSortBy}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              categoriesList={dbCategories as any} 
            />
          </Box>

          <Box w="100%">
            {filteredObjects.length === 0 ? (
              <Center py={20} bg="white" borderRadius="xl" shadow="sm">
                <Text fontSize="xl" color="gray.500">
                  Aún no hay objetos marcados como encontrados o que coincidan con tu búsqueda.
                </Text>
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

      <ObjectDetailsModal
        isOpen={isOpen}
        onClose={onClose}
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

export default FoundObjects;