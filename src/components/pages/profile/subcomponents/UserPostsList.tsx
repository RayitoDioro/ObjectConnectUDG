import { SimpleGrid, Box, Heading, Text, Button, HStack } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import type { FullCardProps } from "@/types";

interface UserPostsListProps {
  posts: FullCardProps[];
  isOwner: boolean;
  onMarkFound: (id: number) => void;
  onMarkLost: (id: number) => void; 
  onDelete: (id: number) => void;
}

const UserPostsList = ({ posts, isOwner, onMarkFound, onMarkLost, onDelete }: UserPostsListProps) => {
  
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
        <Box key={post.id} position="relative" display="flex" flexDirection="column" gap={2}>
          
          <Card
            status={post.status}
            imageUrl={post.imageUrl}
            altText={post.altText}
            title={post.title}
            date={post.date}
            location={post.location}
          />

          {/* PANEL DE CONTROL DEL DUEÑO */}
          {isOwner && (
            <HStack width="100%" justifyContent="space-between">
              
              {/* LÓGICA DE BOTONES ALTERNADOS */}
              {post.status === 'found' ? (
                // SI YA ESTÁ ENCONTRADO -> Muestra botón para volver a PERDIDO
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  flex={1}
                  onClick={() => onMarkLost(post.id)}
                >
                  Volver a publicar
                </Button>
              ) : (
                // SI ESTÁ PERDIDO -> Muestra botón para marcar ENCONTRADO
                <Button 
                  size="sm" 
                  colorScheme="green" 
                  flex={1}
                  onClick={() => onMarkFound(post.id)}
                >
                  Marcar como encontrado
                </Button>
              )}

              {/* Botón Eliminar (Siempre visible) */}
              <Button 
                size="sm" 
                colorScheme="red" 
                variant="outline"
                onClick={() => onDelete(post.id)}
              >
                Eliminar
              </Button>
            </HStack>
          )}

        </Box>
      ))}
    </SimpleGrid>
  );
};

export default UserPostsList;