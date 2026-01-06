import { SimpleGrid, Box, Heading, Text, Button, HStack } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import type { FullCardProps } from "@/types";

interface UserPostsListProps {
  posts: FullCardProps[];
  isOwner: boolean;                 // ¿Es el dueño del perfil?
  onMarkFound: (id: number) => void; // Función para marcar encontrado
  onDelete: (id: number) => void;    // Función para borrar
}

const UserPostsList = ({ posts, isOwner, onMarkFound, onDelete }: UserPostsListProps) => {
  
  if (posts.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading as="h3" size="lg" mb={2}>No hay publicaciones</Heading>
        <Text>Este usuario aún no ha publicado ningún objeto.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} p={4}>
      {posts.map((post) => (
        // Botones pora la tarjeta de encontrado o borrado
        <Box key={post.id} position="relative" display="flex" flexDirection="column" gap={2}>
          
          {/* Tu Card Original */}
          <Card
            status={post.status}
            imageUrl={post.imageUrl}
            altText={post.altText}
            title={post.title}
            date={post.date}
            location={post.location}
          />

          {/* (Solo visible para el dueño) */}
          {isOwner && (
            <HStack width="100%" justifyContent="space-between">
              
              {/* Botón Marcar Encontrado (Solo aparece si NO está encontrado ya) */}
              {post.status !== 'found' && (
                <Button 
                  size="sm" 
                  colorScheme="green" 
                  flex={1}
                  onClick={() => onMarkFound(post.id)}
                >
                  ¡Objeto Encontrado!
                </Button>
              )}

              {/* Botón Eliminar (Siempre aparece) */}
              <Button 
                size="sm" 
                colorScheme="red" 
                variant="outline"
                flex={post.status === 'found' ? 1 : 0} // Se estira si es el único botón
                onClick={() => onDelete(post.id)}
              >
                X
              </Button>
            </HStack>
          )}

        </Box>
      ))}
    </SimpleGrid>
  );
};

export default UserPostsList;