import { useState, useEffect } from 'react';
import { supabaseClient } from './supabaseClient'; 
import { useAuth } from './context/AuthContext'; 
import { 
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, 
  Avatar, useToast, Container, Flex 
} from '@chakra-ui/react';

export default function ProfileSettings() {
  const { session } = useAuth(); 
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      getProfile();
    }
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session!;

      const { data, error } = await supabaseClient
        .from('user_profile')
        .select('first_name, last_name, photo_profile_url')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAvatarUrl(data.photo_profile_url);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      
    } catch (error: unknown) {
      toast({
        title: 'Error al subir imagen',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { user } = session!;

      const updates = {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        photo_profile_url: avatarUrl,
      };

      const { error } = await supabaseClient
        .from('user_profile')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({
        title: 'Error al guardar',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.blue">
          Configurar Perfil
        </Heading>

        <Box bg="white" p={8} borderRadius="lg" shadow="md" border="1px" borderColor="gray.100">
          <VStack spacing={6}>
            
            {/* Sección de Avatar */}
            <Flex direction="column" align="center" gap={4}>
              <Box
                border="4px solid"
                borderRadius="full"
                borderColor="brand.yellow"
                pointerEvents="none"
                p={0}
              >
                <Avatar 
                  size="2xl" 
                  src={avatarUrl || ''} 
                  name={`${firstName} ${lastName}`} 
                  border="none"
                />
              </Box>
              <Button as="label" cursor="pointer" isLoading={uploading} colorScheme="blue" size="sm">
                Cambiar Foto
                <input type="file" hidden accept="image/*" onChange={uploadAvatar} />
              </Button>
            </Flex>

            {/* Formulario */}
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                placeholder="Ej. Juan"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Apellido</FormLabel>
              <Input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                placeholder="Ej. Pérez"
              />
            </FormControl>

            <Button 
              w="full" 
              colorScheme="yellow" 
              color="brand.blue" 
              fontWeight="bold"
              onClick={updateProfile} 
              isLoading={loading}
              loadingText="Guardando..."
            >
              Guardar Cambios
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}