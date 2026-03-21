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
  Spinner,
  Select
} from '@chakra-ui/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabaseClient } from '@/supabaseClient';
import { type UserWithRole } from '@/types';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { UserFormModal } from './UserFormModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

// Constantes
const USERS_PAGE_SIZE = 5;

type SortBy = 'first_name'|'creation_date';
type SortOrder = 'asc' | 'desc';

export const UsersTable = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('creation_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
          creation_date,
          role_id,
          Roles!inner(id, role_name)
        `,
        { count: 'exact' }
      );
      
      if (debouncedSearchTerm.trim()) {
        query = query.or(
          `first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%`
        );
      }

      // aplicación de ordenamiento en bd solo para campos de user_profile
      query = query.order(sortBy, {
        ascending: sortOrder === 'asc'
      }).range(offset, offset + USERS_PAGE_SIZE - 1);

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
        photo_profile_url: '', // No se necesita en esta tabla
        role_id: user.role_id,
        creation_date: user.creation_date,
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
  }, [debouncedSearchTerm, currentPage, sortBy, sortOrder, toast]);

  // Resetear a página 1 cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  // Ejecutar fetch cuando cambie página o búsqueda
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Hacer focus en el input después de buscar
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Debounce del search term
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchTerm.length === 0) {
      setDebouncedSearchTerm('');
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);

    return () => {
      if(debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

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
      <VStack spacing={4} align="stretch">
        <Flex gap={4} wrap="wrap" align="flex-end">
          <Box flex={1} minW="250px">
            <Text fontWeight="bold" color="brand.blue" mb={2} fontSize="sm">
              Buscar
            </Text>
            <Input
              ref={inputRef}
              placeholder="Por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              isDisabled={loading}
            />
          </Box>

          <Box minW="180px">
            <Text fontWeight="bold" color="brand.blue" mb={2} fontSize="sm">
              Ordenar por
            </Text>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              bg="white"
              isDisabled={loading}
              borderColor="gray.300"
            >
              <option value="first_name">Nombre</option>
              <option value="creation_date">Fecha de Registro</option>
            </Select>
          </Box>

          <Box minW="140px">
            <Text fontWeight="bold" color="brand.blue" mb={2} fontSize="sm">
              Orden
            </Text>
            <Flex gap={2}>
              <Button
                flex={1}
                size="sm"
                bg={sortOrder === 'asc' ? 'brand.yellow' : 'gray.200'}
                color={sortOrder === 'asc' ? 'brand.blue' : 'black'}
                fontWeight="bold"
                onClick={() => setSortOrder('asc')}
                isDisabled={loading}
                _hover={{
                  bg: sortOrder === 'asc' ? 'brand.yellowTwo' : 'gray.300'
                }}
              >
                A-Z ↑
              </Button>
              <Button
                flex={1}
                size="sm"
                bg={sortOrder === 'desc' ? 'brand.yellow' : 'gray.200'}
                color={sortOrder === 'desc' ? 'brand.blue' : 'black'}
                fontWeight="bold"
                onClick={() => setSortOrder('desc')}
                isDisabled={loading}
                _hover={{
                  bg: sortOrder === 'desc' ? 'brand.yellowTwo' : 'gray.300'
                }}
              >
                Z-A ↓
              </Button>
            </Flex>
          </Box>
        </Flex>
      </VStack>

      {/* Tabla */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table>
          <Thead bg="brand.blue">
            <Tr>
              <Th color="white" textAlign="center">Nombre</Th>
              <Th color="white" textAlign="center">Rol</Th>
              <Th color="white" textAlign="center">Fecha de Registro</Th>
              <Th color="white" textAlign="center">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Spinner color="brand.yellow" />
                </Td>
              </Tr>
            ) : users.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text color="gray.500">No hay usuarios</Text>
                </Td>
              </Tr>
            ) : (
              users.map((user) => (
                <Tr key={user.user_id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold" color="brand.blue" textAlign="center" py={2}>
                    {user.first_name} {user.last_name}
                  </Td>
                  <Td textAlign="center" py={1}>
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
                  <Td textAlign="center" py={2} fontSize="sm" color="gray.600">
                    {user.creation_date ? new Date(user.creation_date).toLocaleDateString('es-ES') : 'N/A'}
                  </Td>
                  <Td textAlign="center" py={3}>
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
      <VStack spacing={6} align="stretch">
        <Flex justify="center" align="center" wrap="wrap" gap={4}>
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
                _hover={{
                  bg: currentPage === page ? 'brand.blue' : 'gray.300'
                }}
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
        </Flex>

        {/* Stat de total de usuarios */}
        <Flex justify="center" gap={6} wrap="wrap">
          <Box
            bg="white"
            px={6}
            py={3}
            borderRadius="lg"
            boxShadow="md"
            border="2px"
            borderColor="brand.yellow"
          >
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total de Usuarios
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.blue" textAlign="center">
              {totalCount}
            </Text>
          </Box>
        </Flex>
      </VStack>

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