import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSchemas } from '@/hooks/useSchemas';
import { Box, Spinner, Text, VStack, useToast } from '@chakra-ui/react';
import UserProfileCard from './subcomponents/UserProfileCard';
import UserPostsList from './subcomponents/UserPostsList';
import type { FullCardProps, Post, UserProfile } from '@/types';
import { supabaseClient } from '@/supabaseClient';


const Profile = () => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { profile: loggedInUserProfile, loading: authLoading } = useAuth();
  const { getUserById, getPosts } = useSchemas();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<FullCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast(); 

  // Función 1: Marcar como Encontrado
  const handleMarkAsFound = async (postId: number) => {
    try {
      const { error } = await supabaseClient
        .from('posts')
        .update({ post_state_id: 2 }) // Cambiamos el estado a 2 (Encontrado)
        .eq('id', postId);

      if (error) throw error;

      // Actualizamos la lista localmente para que se mueva de sección al instante
      setUserPosts((prevPosts) => 
        prevPosts.map((post) => 
          post.id === postId ? { ...post, status: 'found' } : post
        )
      );

      toast({ title: '¡Objeto marcado como encontrado!', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Error al actualizar', status: 'error', duration: 3000 });
    }
  };

  //  Eliminar Publicación
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) return;

    try {
      const { error } = await supabaseClient
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Quitamos el post de la lista visualmente
      setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      toast({ title: 'Publicación eliminada', status: 'info', duration: 3000 });
    } catch (err) {
      toast({ title: 'Error al eliminar', status: 'error', duration: 3000 });
    }
  };

  const loggedInUserId = loggedInUserProfile?.user_id;


  useEffect(() => {
    const fetchProfileData = async () => {
      const targetUserId = paramUserId || loggedInUserId;

      if (!targetUserId) {
        if (!authLoading) {
            setError('No se pudo determinar el perfil a cargar.');
            setLoading(false);
        }
        return;
      }
      
      // Only fetch if the user profile is not already loaded
      // or if we are switching to a different user's profile.
      if (userProfile?.user_id === targetUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let profileData: UserProfile | null = null;
        if (targetUserId === loggedInUserId) {
            profileData = loggedInUserProfile;
        } else {
            const fetchedProfile = await getUserById(targetUserId) as UserProfile | null;
            if (fetchedProfile) {
                profileData = {
                    user_id: targetUserId,
                    first_name: fetchedProfile.first_name,
                    last_name: fetchedProfile.last_name,
                    photo_profile_url: fetchedProfile.photo_profile_url,
                };
            }
        }
        
        if (!profileData) {
          throw new Error('Usuario no encontrado.');
        }
        setUserProfile(profileData);

        const allPosts: Post[] = await getPosts();
        const postsFromUser = allPosts.filter(p => p.user_id === targetUserId);

        const mappedPosts: FullCardProps[] = postsFromUser.map((post) => ({
            id: post.id,
            status: post.post_state_id === 1 ? 'lost' : 'found',
            imageUrl: post.photo_url || '',
            altText: post.title,
            title: post.title,
            date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
            rawDate: post.date_was_found || post.created_at,
            location: post.location || 'Sin ubicación',
            description: post.description || 'Sin descripción',
            userId: post.user_id,
            authorName: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Usuario Anónimo',
            authorAvatarUrl: profileData?.photo_profile_url || null,
        }));

        setUserPosts(mappedPosts);

      } catch (err: unknown) {
        setError((err as Error).message || 'Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchProfileData();
    }
  }, [paramUserId, loggedInUserId, authLoading, getUserById, getPosts, userProfile]);

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No se encontró el perfil del usuario.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <UserProfileCard profile={userProfile} />
      <UserPostsList 
        posts={userPosts} 
        isOwner={loggedInUserId === userProfile.user_id} // ¿Es mi perfil?
        onMarkFound={handleMarkAsFound} // Le pasamos la función
        onDelete={handleDeletePost}     // Le pasamos la función
      />
    </VStack>
  );
};

export default Profile;