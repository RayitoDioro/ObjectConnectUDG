import { Avatar, Box, Heading, VStack } from "@chakra-ui/react";
import { type UserProfile } from "@/types";

interface UserProfileCardProps {
  profile: UserProfile;
}

const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  return (
    <VStack spacing={4} align="center" py={8}>
      <Box
        border="4px solid"
        borderColor="brand.yellow"
        borderRadius="full"
        p={0}
        pointerEvents="none"
      >
        <Avatar
          size="2xl"
          name={`${profile.first_name} ${profile.last_name}`}
          src={profile.photo_profile_url || ''}
        />
      </Box>
      <Heading as="h2" size="xl">
        {profile.first_name} {profile.last_name}
      </Heading>
      {/* El email no está en la tabla user_profile, se necesitaría obtener de la sesión si es el usuario propio */}
      {/* <Text fontSize="lg" color="gray.500">{profile.email}</Text> */}
    </VStack>
  );
};

export default UserProfileCard;
