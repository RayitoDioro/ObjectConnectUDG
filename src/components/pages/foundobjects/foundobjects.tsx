import { useState, useEffect } from 'react';
import { useSchemas } from '@/hooks/useSchemas'; 
import { Box, SimpleGrid, Spinner, Heading, Text, Container, VStack } from '@chakra-ui/react';
import Card from '@/components/ui/Card';
import type { FullCardProps, Post } from '@/types';

const FoundObjects = () => {
  const { getPosts } = useSchemas(); // Importamos la función que baja los datos
  
  const [foundPosts, setFoundPosts] = useState<FullCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoundObjects = async () => {
      try {
        setLoading(true);
        // Bajamos TODAS las publicaciones
        const allPosts: Post[] = await getPosts();

        // Filtramos SOLO las que son "Encontrados" (ID 2)
        const onlyFound = allPosts.filter(post => post.post_state_id === 2);

        // Convertimos datos a las tarjetas de la plantilla
        const mappedPosts: FullCardProps[] = onlyFound.map((post) => ({
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
            
            // Datos que faltan (PENDIENTE)
            authorName: 'Usuario de la Comunidad', // Texto genérico
            authorAvatarUrl: null,                 // Sin foto por ahora
        }));

        setFoundPosts(mappedPosts);
      } catch (error) {
        console.error("Error cargando objetos encontrados:", error);
      } finally {
        setLoading(false);
      }
    };

   fetchFoundObjects();
  }, []); // <--- Array vacío: solo se ejecuta al inicio

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        
        <Box textAlign="center" mb={4}>
          <Heading as="h1" size="2xl" color="green.600" mb={3}>
            Objetos Encontrados
          </Heading>
          <Text fontSize="lg" color="gray.600">
            ¡Estos artículos ya han regresado con sus dueños o han sido hallados!
          </Text>
        </Box>

        {/* Si no hay nada encontrado todavía */}
        {foundPosts.length === 0 ? (
          <Box textAlign="center" py={20} bg="gray.50" borderRadius="xl">
            <Text fontSize="xl" color="gray.500">
              Aún no hay objetos marcados como encontrados.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {foundPosts.map((post) => (
              <Card
                key={post.id}
                status={post.status}
                imageUrl={post.imageUrl}
                altText={post.altText}
                title={post.title}
                date={post.date}
                location={post.location}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default FoundObjects;