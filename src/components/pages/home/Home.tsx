import { useState, useEffect } from "react";
import { Box, Center, Spinner } from "@chakra-ui/react";
import PresentationSection from './subComponents/PresentationSection';
import FilterSortControls from './subComponents/FilterSortControls';
import ObjectGrid from "./subComponents/ObjectGrid";
import { type CardProps, type Post } from "@/types"; 
import { useObjectFilter } from "./hooks/useObjectFilter";
import { useSchemas } from "@/hooks/useSchemas"; 

const Home = () => {
  // guardaremos lo que baje de la base de datos
  const [dbObjects, setDbObjects] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hook para bajar datos de Supabase
  const { getPosts } = useSchemas();

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        setLoading(true);
        const rawPosts: Post[] = await getPosts();

        const formattedObjects: CardProps[] = rawPosts.map((post) => ({
          id: post.id,
          // Mapeamos el ID numérico a string 'lost' o 'found'
          // Asumimos: 1 = Perdido, 2 = Encontrado
          status: post.post_state_id === 1 ? "lost" : "found",
          imageUrl: post.photo_url || "",
          altText: post.title,
          title: post.title,
          date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
          location: post.location || "Sin ubicación",
        }));

        setDbObjects(formattedObjects);
      } catch (error) {
        console.error("Error cargando objetos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, []); // Array vacío = Solo se ejecuta una vez al inicio

  // Pasamos los datos REALES (dbObjects) a tu hook de filtros
  const {
    searchObj,
    setSearchObj,
    sortBy,
    setSortBy,
    filteredObjects
  } = useObjectFilter(dbObjects); 
  
  // Separamos las listas para las columnas izquierda/derecha
  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');

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
      />

      <ObjectGrid
        lostItems={lostItems}
        foundItems={foundItems}
        searchObj={searchObj}
      />
    </Box>
  );
}

export default Home;