import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { supabaseClient } from '@/supabaseClient';
import type { Role } from '@/types';
import { RoleFormModal } from './RoleFormModal';
import { RoleDeleteModal } from './RoleDeleteModal';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

// Constantes
const ROLES_PAGE_SIZE = 5;

type SortBy = 'role_name' | 'created_at' | 'descripcion';
type SortOrder = 'asc' | 'desc';

export const RolesTable = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Permisos
  const { hasPermission } = usePermissions();

  useEffect(() => {
    console.log('EDIT_ROLES permiso:', hasPermission(PERMISSIONS.EDIT_ROLES));
    console.log('DELETE_ROLES permiso:', hasPermission(PERMISSIONS.DELETE_ROLES));
  }, [hasPermission]);

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
  const totalPages = Math.ceil(totalCount / ROLES_PAGE_SIZE);

  // Cargar roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      // Contar total
      const { count } = await supabaseClient
        .from('Roles')
        .select('*', { count: 'exact', head: true })
        .ilike('role_name', `%${debouncedSearchTerm}%`);

      setTotalCount(count || 0);

      // Obtener roles paginados
      const { data, error } = await supabaseClient
        .from('Roles')
        .select('*')
        .ilike('role_name', `%${debouncedSearchTerm}%`)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * ROLES_PAGE_SIZE, currentPage * ROLES_PAGE_SIZE - 1);

      if (error) throw error;

      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los roles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage, sortBy, sortOrder, toast]);

  // Resetear a página 1 cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  // Ejecutar fetch
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Hacer focus en input
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Debounce search
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
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    onFormOpen();
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    onDeleteOpen();
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    onFormOpen();
  };

  const handleFormClose = () => {
    setSelectedRole(null);
    onFormClose();
    fetchRoles();
  };

  const handleDeleteClose = () => {
    setSelectedRole(null);
    onDeleteClose();
  };

  const handleDeleteSuccess = () => {
    handleDeleteClose();
    setCurrentPage(1);
    fetchRoles();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Encabezado */}
      <Box>
        <Heading color="brand.blue" mb={2} size="lg">
          Gestionar Roles
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
              placeholder="Por nombre de rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              isDisabled={loading}
            />
          </Box>
          <Box minW="300px">
            <Text fontWeight="bold" color="brand.blue" mb={2} fontSize="sm">
              Ordenar por
            </Text>
            <HStack spacing={1}>
              <Button
                flex={1}
                size="sm"
                bg={sortBy === 'role_name' ? 'brand.yellow' : 'gray.200'}
                color={sortBy === 'role_name' ? 'brand.blue' : 'black'}
                fontWeight="bold"
                onClick={() => setSortBy('role_name')}
                isDisabled={loading}
                _hover={{
                  bg: sortBy === 'role_name' ? 'brand.yellowTwo' : 'gray.300'
                }}
              >
                Nombre
              </Button>
              <Button
                flex={1}
                size="sm"
                bg={sortBy === 'descripcion' ? 'brand.yellow' : 'gray.200'}
                color={sortBy === 'descripcion' ? 'brand.blue' : 'black'}
                fontWeight="bold"
                onClick={() => setSortBy('descripcion')}
                isDisabled={loading}
                _hover={{
                  bg: sortBy === 'descripcion' ? 'brand.yellowTwo' : 'gray.300'
                }}
              >
                Descripción
              </Button>
              <Button
                flex={1}
                size="sm"
                bg={sortBy === 'created_at' ? 'brand.yellow' : 'gray.200'}
                color={sortBy === 'created_at' ? 'brand.blue' : 'black'}
                fontWeight="bold"
                onClick={() => setSortBy('created_at')}
                isDisabled={loading}
                _hover={{
                  bg: sortBy === 'created_at' ? 'brand.yellowTwo' : 'gray.300'
                }}
              >
                Fecha
              </Button>
            </HStack>
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

          {/* Botón Nuevo Rol */}
          {hasPermission(PERMISSIONS.CREATE_ROLES) && (
            <Button
              bg="brand.blue"
              color="white"
              fontWeight="bold"
              onClick={handleAddNew}
              isDisabled={loading}
              _hover={{ bg: '#1A3258' }}
              h="40px"
            >
              + Nuevo Rol
            </Button>
          )}
        </Flex>
      </VStack>

      {/* Tabla */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table>
          <Thead bg="brand.blue">
            <Tr>
              <Th color="white" textAlign="center">
                <Flex justify="center" align="center" gap={2} cursor="pointer">
                  <Text>Nombre</Text>
                  <IconButton
                    aria-label="Ordenar por nombre"
                    icon={
                      <Icon
                        as={
                          sortBy === 'role_name' && sortOrder === 'asc'
                            ? FiArrowUp
                            : sortBy === 'role_name' && sortOrder === 'desc'
                            ? FiArrowDown
                            : FiArrowUp
                        }
                      />
                    }
                    size="sm"
                    bg="transparent"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                    onClick={() => {
                      if (sortBy === 'role_name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('role_name');
                        setSortOrder('asc');
                      }
                    }}
                  />
                </Flex>
              </Th>
              <Th color="white" textAlign="center">
                <Flex justify="center" align="center" gap={2} cursor="pointer">
                  <Text>Descripción</Text>
                  <IconButton
                    aria-label="Ordenar por descripción"
                    icon={
                      <Icon
                        as={
                          sortBy === 'descripcion' && sortOrder === 'asc'
                            ? FiArrowUp
                            : sortBy === 'descripcion' && sortOrder === 'desc'
                            ? FiArrowDown
                            : FiArrowUp
                        }
                      />
                    }
                    size="sm"
                    bg="transparent"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                    onClick={() => {
                      if (sortBy === 'descripcion') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('descripcion');
                        setSortOrder('asc');
                      }
                    }}
                  />
                </Flex>
              </Th>
              <Th color="white" textAlign="center">
                <Flex justify="center" align="center" gap={2} cursor="pointer">
                  <Text>Fecha de Creación</Text>
                  <IconButton
                    aria-label="Ordenar por fecha"
                    icon={
                      <Icon
                        as={
                          sortBy === 'created_at' && sortOrder === 'asc'
                            ? FiArrowUp
                            : sortBy === 'created_at' && sortOrder === 'desc'
                            ? FiArrowDown
                            : FiArrowUp
                        }
                      />
                    }
                    size="sm"
                    bg="transparent"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                    onClick={() => {
                      if (sortBy === 'created_at') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('created_at');
                        setSortOrder('asc');
                      }
                    }}
                  />
                </Flex>
              </Th>
              <Th color="white" textAlign="center">
                Acciones
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Spinner color="brand.yellow" />
                </Td>
              </Tr>
            ) : roles.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text color="gray.500">No hay roles encontrados</Text>
                </Td>
              </Tr>
            ) : (
              roles.map((role) => (
                <Tr key={role.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold" color="brand.blue" textAlign="center" py={4}>
                    {role.role_name}
                  </Td>
                  <Td textAlign="center" py={4} fontSize="sm" color="gray.600">
                    {role.descripcion || '-'}
                  </Td>
                  <Td textAlign="center" py={4} fontSize="sm" color="gray.600">
                    {role.created_at ? new Date(role.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </Td>
                  <Td textAlign="center" py={4}>
                    <HStack spacing={2} justify="center">
                      {hasPermission(PERMISSIONS.EDIT_ROLES) && (
                        <IconButton
                          aria-label="Editar"
                          icon={<Icon as={FiEdit} />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(role)}
                        />
                      )}
                      {hasPermission(PERMISSIONS.DELETE_ROLES) && (
                        <IconButton
                          aria-label="Eliminar"
                          icon={<Icon as={FiTrash2} />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(role)}
                        />
                      )}
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

        {/* Stats */}
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
              Total de Roles
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.blue" textAlign="center">
              {totalCount}
            </Text>
          </Box>
        </Flex>
      </VStack>

      {/* Modales */}
      <RoleFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        role={selectedRole}
        onSuccess={() => {
          handleFormClose();
        }}
      />

      <RoleDeleteModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        role={selectedRole}
        onSuccess={handleDeleteSuccess}
      />
    </VStack>
  );
};