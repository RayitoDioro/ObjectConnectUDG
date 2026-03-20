import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Heading,
  VStack,
  Input
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/supabaseClient';
import { type UserProfile } from '@/types';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { UserFormModal } from './UserFormModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

type UserWithRole = UserProfile & { role_name?: string };

export const UsersTable = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const toast = useToast();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('user_profile')
        .select(`
          *,
          Roles(id, role_name)
        `);

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      setUsers(
        (data || []).map((user: any) => ({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            role_id: user.role_id,
            photo_profile_url: user.photo_profile_url,
            role_name: user.Roles.role_name || 'N/A',
        }))
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: UserWithRole) => {
    setSelectedUser(user);
    onFormOpen();
  };

  const handleDelete = (user: UserWithRole) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabaseClient
        .from('user_profile')
        .delete()
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      setUsers(users.filter((u) => u.user_id !== selectedUser.user_id));
      toast({
        title: 'Éxito',
        description: 'Usuario eliminado correctamente',
        status: 'success',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        status: 'error',
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleFormClose = () => {
    setSelectedUser(null);
    onFormClose();
    fetchUsers();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Encabezado */}
      <Box>
        <Heading color="brand.blue" mb={2} size="lg">
          Gestionar Usuarios
        </Heading>
        <Box h="4px" w="60px" bg="brand.yellow" borderRadius="full" />
      </Box>

      {/* Controles */}
      <HStack spacing={4} wrap="wrap">
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w={{ base: '100%', md: '300px' }}
          bg="white"
        />
        <Button
          leftIcon={<Icon as={FiPlus} />}
          bg="brand.yellow"
          color="brand.blue"
          fontWeight="bold"
          _hover={{ bg: 'brand.yellowTwo' }}
          onClick={() => {
            setSelectedUser(null);
            onFormOpen();
          }}
        >
          Nuevo Usuario
        </Button>
      </HStack>

      {/* Tabla */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table>
          <Thead bg="brand.blue">
            <Tr>
              <Th color="white">Nombre</Th>
              <Th color="white">Rol</Th>
              <Th color="white">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text>Cargando...</Text>
                </Td>
              </Tr>
            ) : filteredUsers.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text>No hay usuarios</Text>
                </Td>
              </Tr>
            ) : (
              filteredUsers.map((user) => (
                <Tr key={user.user_id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold" color="brand.blue">
                    {user.first_name} {user.last_name}
                  </Td>
                  <Td>{user.role_name}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Editar"
                        icon={<Icon as={FiEdit} />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<Icon as={FiTrash2} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(user)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modales */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        user={selectedUser}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description={`¿Está seguro de que desea eliminar a ${selectedUser?.first_name}?`}
      />
    </VStack>
  );
};