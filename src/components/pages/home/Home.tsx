import { useState, useEffect } from "react";
import { Box, Center, Spinner, useDisclosure } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 

import PresentationSection from './subComponents/PresentationSection';
import FilterSortControls from './subComponents/FilterSortControls';
import ObjectGrid from "./subComponents/ObjectGrid";
import { type Post } from "@/types"; 
import { useObjectFilter } from "./hooks/useObjectFilter";
import { useSchemas } from "@/hooks/useSchemas"; 
// IMPORTAMOS TU HOOK PARA CREAR HILOS
import { useSchemas as useLostObjectPageSchemas } from '@/components/pages/lostobjects/hooks/useSchemas';
import { supabaseClient } from "@/supabaseClient"; 

import ObjectDetailsModal, { type ExtendedCardProps } from "@/components/common/ObjectDetailsModal";

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
  // EXTRAEMOS LA FUNCIÓN PARA CREAR EL CHAT
  const { createThreaForPost } = useLostObjectPageSchemas();

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
            locationAreaName: post.location_area_name || "",
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

  // MAGIA APLICADA: Ahora creamos el hilo con Supabase antes de navegar
  const handleStartChat = async (authorId: string) => {
    if (!selectedObj || !currentUserId) return;
    
    // selectedObj.id es el postId
    const threadId = await createThreaForPost(authorId, selectedObj.id as number, currentUserId);
    if (threadId) {
        navigate(`/chats/${threadId}`);
    } else {
        console.error("No se pudo crear el hilo de chat.");
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

      <ObjectDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        selectedObj={selectedObj}
        currentUserId={currentUserId}
        onStartChat={handleStartChat} // Pasamos la nueva función conectada a Supabase
      />
    </Box>
  );
}

export default Home;