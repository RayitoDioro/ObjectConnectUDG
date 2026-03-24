import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Icon,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Badge,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { supabaseClient } from '@/supabaseClient';
import type { Role, Permission } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

// Constantes
const ROLES_PAGE_SIZE = 5;

export const RolePermissionsTable = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [currentRolePermissions, setCurrentRolePermissions] = useState<Set<number>>(new Set());
  const [rolesPermissionsMap, setRolesPermissionsMap] = useState<Map<number, number[]>>(new Map());
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Permisos
  const { hasPermission } = usePermissions();

  const {
    isOpen: isPermissionsModalOpen,
    onOpen: onPermissionsModalOpen,
    onClose: onPermissionsModalClose,
  } = useDisclosure();

  // Calcular páginas totales
  const totalPages = Math.ceil(totalCount / ROLES_PAGE_SIZE);

  // Cargar permisos globales
  const fetchAllPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient
        .from('permisos')
        .select('*')
        .order('permiso', { ascending: true });

      if (error) throw error;

      setAllPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Cargar permisos de TODOS los roles
  const fetchAllRolesPermissions = useCallback(async (roleIds: number[]) => {
    try {
      const { data, error } = await supabaseClient
        .from('roles_permisos')
        .select('rol_id, permiso_id')
        .in('rol_id', roleIds);

      if (error) throw error;

      // Crear un mapa: rol_id -> [permiso_ids]
      const map = new Map<number, number[]>();
      (data || []).forEach(rp => {
        if (!map.has(rp.rol_id)) {
          map.set(rp.rol_id, []);
        }
        map.get(rp.rol_id)!.push(rp.permiso_id);
      });

      setRolesPermissionsMap(map);
    } catch (error) {
      console.error('Error fetching all roles permissions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos de los roles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

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
        .order('role_name', { ascending: true })
        .range((currentPage - 1) * ROLES_PAGE_SIZE, currentPage * ROLES_PAGE_SIZE - 1);

      if (error) throw error;

      setRoles(data || []);

      // Cargar permisos de estos roles específicos
      if (data && data.length > 0) {
        const roleIds = data.map(r => r.id);
        await fetchAllRolesPermissions(roleIds);
      }
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
  }, [debouncedSearchTerm, currentPage, toast, fetchAllRolesPermissions]);

  // Cargar permisos de un rol específico (para el modal)
  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const { data, error } = await supabaseClient
        .from('roles_permisos')
        .select('permiso_id')
        .eq('rol_id', roleId);

      if (error) throw error;

      const permissionIds = (data || []).map(rp => rp.permiso_id);
      setRolePermissions(permissionIds);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos del rol',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Resetear a página 1 cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllPermissions();
    fetchRoles();
  }, [fetchAllPermissions, fetchRoles]);

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

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
    onPermissionsModalOpen();
  };

  // Actualizar cuando cambian los permisos del rol
  useEffect(() => {
    setCurrentRolePermissions(new Set(rolePermissions));
  }, [rolePermissions]);

  const handlePermissionToggle = (permissionId: number) => {
    setCurrentRolePermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      // 1. Eliminar todos los permisos actuales del rol
      await supabaseClient
        .from('roles_permisos')
        .delete()
        .eq('rol_id', selectedRole.id);

      // 2. Insertar nuevos permisos
      if (currentRolePermissions.size > 0) {
        const newPermissions = Array.from(currentRolePermissions).map(permiso_id => ({
          rol_id: selectedRole.id,
          permiso_id,
        }));

        const { error } = await supabaseClient
          .from('roles_permisos')
          .insert(newPermissions);

        if (error) throw error;
      }

      toast({
        title: 'Éxito',
        description: 'Permisos del rol actualizados correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPermissionsModalClose();
      setSelectedRole(null);
      setRolePermissions([]);
      setCurrentRolePermissions(new Set());
      fetchRoles();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los permisos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Encabezado */}
      <Box>
        <Heading color="brand.blue" mb={2} size="lg">
          Gestionar Permisos por Rol
        </Heading>
        <Box h="4px" w="60px" bg="brand.yellow" borderRadius="full" />
      </Box>

      {/* Búsqueda */}
      <VStack spacing={4} align="stretch">
        <Box maxW="400px">
          <Text fontWeight="bold" color="brand.blue" mb={2} fontSize="sm">
            Buscar Rol
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
      </VStack>

      {/* Tabla */}
      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
        <Table>
          <Thead bg="brand.blue">
            <Tr>
              <Th color="white" textAlign="center">
                Rol
              </Th>
              <Th color="white" textAlign="center">
                Permisos Asignados
              </Th>
              <Th color="white" textAlign="center">
                Acciones
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Spinner color="brand.yellow" />
                </Td>
              </Tr>
            ) : roles.length === 0 ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Text color="gray.500">No hay roles encontrados</Text>
                </Td>
              </Tr>
            ) : (
              roles.map((role) => {
                // ✅ CAMBIO: Obtener permisos del rol desde el mapa
                const rolePermIds = rolesPermissionsMap.get(role.id) || [];
                const rolePerms = allPermissions.filter(perm =>
                  rolePermIds.includes(perm.id)
                );

                return (
                  <Tr key={role.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="bold" color="brand.blue" textAlign="center" py={4}>
                      {role.role_name}
                    </Td>
                    <Td textAlign="center" py={4}>
                      <Flex gap={2} wrap="wrap" justify="center">
                        {rolePerms.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">
                            Sin permisos administrativos
                          </Text>
                        ) : rolePerms.length <= 3 ? (
                          rolePerms.map(perm => (
                            <Badge key={perm.id} bg="brand.yellow" color="brand.blue">
                              {perm.permiso}
                            </Badge>
                          ))
                        ) : (
                          <>
                            {rolePerms.slice(0, 2).map(perm => (
                              <Badge key={perm.id} bg="brand.yellow" color="brand.blue">
                                {perm.permiso}
                              </Badge>
                            ))}
                            <Badge bg="gray.300" color="black">
                              +{rolePerms.length - 2}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Td>
                    <Td textAlign="center" py={4}>
                      {hasPermission(PERMISSIONS.EDIT_ROLES) && (
                        <Button
                          size="sm"
                          bg="brand.blue"
                          color="white"
                          onClick={() => handleEditPermissions(role)}
                          _hover={{ bg: '#1A3258' }}
                        >
                          Editar
                        </Button>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Paginación */}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap={4}>
          <Button
            isDisabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            leftIcon={<Icon as={FiChevronLeft} />}
            bg="brand.yellow"
            color="brand.blue"
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Anterior
          </Button>

          <Text fontSize="sm" fontWeight="bold">
            Página {currentPage} de {totalPages}
          </Text>

          <Button
            isDisabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            rightIcon={<Icon as={FiChevronRight} />}
            bg="brand.yellow"
            color="brand.blue"
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Siguiente
          </Button>
        </Flex>
      )}

      {/* Modal de Permisos */}
      <Modal isOpen={isPermissionsModalOpen} onClose={onPermissionsModalClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            Permisos para: <Text as="span" color="brand.blue">{selectedRole?.role_name}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {allPermissions.length === 0 ? (
                <Text color="gray.500">No hay permisos disponibles</Text>
              ) : (
                allPermissions.map(permission => (
                  <Box
                    key={permission.id}
                    p={3}
                    border="1px"
                    borderColor={currentRolePermissions.has(permission.id) ? 'brand.blue' : 'gray.200'}
                    borderRadius="lg"
                    bg={currentRolePermissions.has(permission.id) ? 'blue.50' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    onClick={() => handlePermissionToggle(permission.id)}
                  >
                    <HStack spacing={3}>
                      <Checkbox
                        isChecked={currentRolePermissions.has(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        size="lg"
                        colorScheme="blue"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" color="brand.blue">
                          {permission.permiso}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {permission.descripcion || 'Sin descripción'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPermissionsModalClose}>
              Cancelar
            </Button>
            <Button
              bg="brand.blue"
              color="white"
              isLoading={saving}
              onClick={handleSavePermissions}
              _hover={{ bg: '#1A3258' }}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};