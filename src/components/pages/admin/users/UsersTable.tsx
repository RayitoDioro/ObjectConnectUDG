import {
  Box,
  Button,
  Flex,
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
  Input,
  Spinner
} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/supabaseClient';
import { type UserWithRole } from '@/types';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { UserFormModal } from './UserFormModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

// Constantes
const USERS_PAGE_SIZE = 2;

export const UsersTable = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Calcular páginas totales
  const totalPages = Math.ceil(totalCount / USERS_PAGE_SIZE);

  // Cargar usuarios
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Calculo del offset
      const offset = (currentPage - 1) * USERS_PAGE_SIZE;

      let query = supabaseClient
        .from('user_profile')
        .select(`
          user_id,
          first_name,
          last_name,
          photo_profile_url,
          role_id,
          Roles!inner(id, role_name)
        `,
        { count: 'exact' }
      ).order('creation_date', { ascending: false })
      .range(offset, offset + USERS_PAGE_SIZE - 1);
      
      if (searchTerm.trim()) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query as unknown as {
        data: UserWithRole[] | null;
        error: unknown;
        count: number | null;
      };

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      setTotalCount(count || 0);

       // Transformar datos de forma segura
      const transformedUsers = (data || []).map((user: UserWithRole) => ({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_profile_url: user.photo_profile_url,
        role_id: user.role_id,
        Roles: user.Roles,
        role_name: user.Roles?.role_name || 'Sin rol'
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, toast]);

  // Resetear a página 1 cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Ejecutar fetch cuando cambie página o búsqueda
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: UserWithRole) => {
    setSelectedUser(user);
    onFormOpen();
  };

  const handleDelete = (user: UserWithRole) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  // Usar función RPC para eliminar usuario completo
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      // Usar función RPC en lugar de query directa, 
      // esto ejecuta la función SQL en Supabase
      const { error } = await supabaseClient.rpc('delete_user_complete', {
        user_id_input: selectedUser.user_id,
      });

      if (error) throw error;

      // Actualizar estado local
      setUsers(users.filter((u) => u.user_id !== selectedUser.user_id));
      setTotalCount(totalCount - 1);

      toast({
        title: 'Éxito',
        description: 'Usuario eliminado correctamente',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        status: 'error',
        duration: 3000
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
          placeholder="Buscar por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w={{ base: '100%', md: '300px' }}
          bg="white"
          isDisabled={loading}
        />
      </HStack>

      {/* Tabla */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table>
          <Thead bg="brand.blue">
            <Tr>
              <Th color="white" textAlign="center">Nombre</Th>
              <Th color="white" textAlign="center">Rol</Th>
              <Th color="white" textAlign="center">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Spinner color="brand.yellow" />
                </Td>
              </Tr>
            ) : users.length === 0 ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Text color="gray.500">No hay usuarios</Text>
                </Td>
              </Tr>
            ) : (
              users.map((user) => (
                <Tr key={user.user_id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold" color="brand.blue" textAlign="center">
                    {user.first_name} {user.last_name}
                  </Td>
                  <Td textAlign="center">
                    <Flex justify="center">
                      <Box
                        px={4}
                        py={2}
                        borderRadius="full"
                        bg="brand.lightGray"
                        color="brand.darkGrayText"
                        fontWeight="600"
                        fontSize="sm"
                        w="fit-content"
                      >
                        {user.Roles?.role_name}
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <HStack spacing={2} justify="center">
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

      {/* Paginación */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack spacing={2}>
          <IconButton
            aria-label="Página anterior"
            icon={<Icon as={FiChevronLeft} />}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            isDisabled={currentPage === 1 || loading}
            bg="brand.yellow"
            color="brand.blue"
            _hover={{ bg: 'brand.yellowTwo' }}
          />
          
          {/* Botones de páginas */}
          <HStack spacing={1}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                bg={currentPage === page ? 'brand.blue' : 'gray.200'}
                color={currentPage === page ? 'white' : 'black'}
                fontWeight={currentPage === page ? 'bold' : 'normal'}
                size="sm"
                isDisabled={loading}
              >
                {page}
              </Button>
            ))}
          </HStack>

          <IconButton
            aria-label="Página siguiente"
            icon={<Icon as={FiChevronRight} />}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            isDisabled={currentPage === totalPages || loading}
            bg="brand.yellow"
            color="brand.blue"
            _hover={{ bg: 'brand.yellowTwo' }}
          />
        </HStack>
        
        <Text fontSize="sm" color="gray.600">
          Total: {totalCount} usuarios
        </Text>

        <Text fontSize="sm" color="gray.600">
          Página {currentPage} de {totalPages}
        </Text>
      </Flex>

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
        description={`¿Está seguro de que desea eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
      />
    </VStack>
  );
};