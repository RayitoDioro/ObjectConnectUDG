import { Box, Heading, VStack, HStack, Button, useToast, Stat, StatLabel, StatNumber, StatHelpText, Grid, GridItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type Statistics } from '@/types';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/supabaseClient';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalRoles: 0,
    totalPosts: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
        try{
            setLoading(true);

            // usuarios totales
            const { count: usersCount } = await supabaseClient
            .from('user_profile')
            .select('*', { count: 'exact', head: true });

            // roles totales
            const { count: rolesCount } = await supabaseClient
            .from('Roles')
            .select('*', { count: 'exact', head: true });

            // posts totales
            const {count: postsCount} = await supabaseClient
            .from('posts')
            .select('*', {count : 'exact', head: true});

            // usuarios creados en los últimos 7 días
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString();

            const {count: activeUsersCount} = await supabaseClient
            .from('user_profile')
            .select('*', {count: 'exact', head: true})
            .gte('creation_date', sevenDaysAgo);

            setStats({
              totalUsers: usersCount || 0,
              totalRoles: rolesCount || 0,
              totalPosts: postsCount || 0,
              activeUsers: activeUsersCount || 0
            });

        } catch(error){
            console.error('Error fetching statistics:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las estadísticas: ' + error,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    fetchStatistics();
  }, [toast]);

  const StatCard = ({label, number, helpText}: {label: string; number: number; helpText?: string}) => (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md" textAlign="center">
      <Stat>
        <StatLabel fontSize="md" color="brand.blue" fontWeight="bold">
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" color="brand.yellow" fontWeight="bold">
          {loading ? '...' : number}
        </StatNumber>
        {helpText && <StatHelpText color="gray.500">{helpText}</StatHelpText>}
      </Stat>
    </Box>
  );

  return (
    <VStack spacing={8} align="stretch">
      {/* Encabezado */}
      <Box>
        <Heading color="brand.blue" mb={2} size="lg">
          Dashboard administrativo
        </Heading>
        <Box h="4px" w="60px" bg="brand.yellow" borderRadius="full" />
      </Box>

      {/* Estadísticas */}
      <Grid 
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)'}}
        gap={{base: 4, md: 6}}
      >
        <GridItem>
          <StatCard label='Total usuarios' number={stats.totalUsers} helpText='registrados'/>
        </GridItem>
        <GridItem>
          <StatCard label='Total roles' number={stats.totalRoles} helpText='existentes'/>
        </GridItem>
        <GridItem>
          <StatCard label='Total de Posts' number={stats.totalPosts} helpText='creados'/>
        </GridItem>
        <GridItem>
          <StatCard label='Usuarios nuevos' number={stats.activeUsers} helpText='en últimos 7 días'/>
        </GridItem>
      </Grid>

      {/* opciones de gestión */}
        <Box>
          <Heading size="lg" mb={4} color="brand.blue">
            Gestión
          </Heading>
          <Box h="4px" w="60px" bg="brand.yellow" borderRadius="full" />
        </Box>
        
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} wrap="wrap">
          <HStack 
            spacing={3}
            wrap="wrap"
            gap={4}
          >
            <Button 
              onClick={() => navigate('/admin/usuarios')}
              bg="brand.yellow"
              color="brand.blue"
              fontWeight="bold"
              _hover={{ bg: 'brand.yellowTwo' }}
              w={{ base: '100%', sm: 'auto' }}
            >
              Roles de Usuarios
            </Button>
            
            <Button 
              onClick={() => navigate('/admin/roles')}
              bg="brand.yellow"
              color="brand.blue"
              fontWeight="bold"
              _hover={{ bg: 'brand.yellowTwo' }}
              w={{ base: '100%', sm: 'auto' }}
            >
              Gestionar Roles
            </Button>

            <Button 
              onClick={() => navigate('/admin/posts')}
              bg="brand.yellow"
              color="brand.blue"
              fontWeight="bold"
              _hover={{ bg: 'brand.yellowTwo' }}
              w={{ base: '100%', sm: 'auto' }}
            >
              Gestionar Posts
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>

  );
};