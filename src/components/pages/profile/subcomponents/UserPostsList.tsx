import { SimpleGrid, Box, Heading, Text } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import type { FullCardProps } from "@/types";

interface UserPostsListProps {
  posts: FullCardProps[];
}

const UserPostsList = ({ posts }: UserPostsListProps) => {
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
  );
};

export default UserPostsList;
