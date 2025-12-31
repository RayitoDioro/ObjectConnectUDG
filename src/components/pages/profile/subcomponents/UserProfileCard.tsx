import { Avatar, Box, Heading, Text, VStack } from "@chakra-ui/react";
import { type UserProfile } from "@/context/AuthContext";

interface UserProfileCardProps {
  profile: UserProfile;
}

const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  return (
    <VStack spacing={4} align="center" py={8}>
      <Avatar
        size="2xl"
        name={`${profile.first_name} ${profile.last_name}`}
        src={profile.photo_profile_url || ''}
      />
      <Heading as="h2" size="xl">
        {profile.first_name} {profile.last_name}
      </Heading>
      {/* El email no está en la tabla user_profile, se necesitaría obtener de la sesión si es el usuario propio */}
      {/* <Text fontSize="lg" color="gray.500">{profile.email}</Text> */}
    </VStack>
  );
};

export default UserProfileCard;
