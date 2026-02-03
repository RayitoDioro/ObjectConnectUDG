import { Box, Heading, VStack, HStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box p={8}>
      <Heading mb={6} color="brand.blue">Panel Administrativo</Heading>
      
      <VStack spacing={4} align="start">
        <HStack spacing={4}>
          <Button 
            onClick={() => navigate('/admin/usuarios')}
            bg="brand.yellow"
            color="brand.blue"
            fontWeight="bold"
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Gestionar Usuarios
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/roles')}
            bg="brand.yellow"
            color="brand.blue"
            fontWeight="bold"
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Gestionar Roles
          </Button>

          <Button 
            onClick={() => navigate('/admin/posts')}
            bg="brand.yellow"
            color="brand.blue"
            fontWeight="bold"
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Gestionar Posts
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};