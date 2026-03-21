import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  Text,
  Box
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/supabaseClient';
import { type UserProfile, type Role } from '@/types';

type UserWithRole = UserProfile & { role_name?: string };

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithRole | null;
};

export const UserFormModal = ({ isOpen, onClose, user }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    role_id: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        setFormData({
          role_id: user.role_id?.toString() || '',
        });
      } else {
        setFormData({ role_id: '' });
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabaseClient.from('Roles').select('*');
      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.role_id) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona el nuevo rol',
        status: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      if (user) {
        // Actualizar
        const { error } = await supabaseClient
          .from('user_profile')
          .update({
            role_id: parseInt(formData.role_id),
          })
          .eq('user_id', user.user_id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Usuario actualizado correctamente',
          status: 'success',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderTop="4px" borderTopColor="brand.yellow">
        <ModalHeader 
          color="brand.blue"
          fontWeight="bold"
          fontSize="lg"
        >
          Cambiar rol de {user?.first_name} {user?.last_name}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Info del usuario */}
            <Box 
              bg="gray.50" 
              p={4} 
              borderRadius="md"
              borderLeft="4px"
              borderLeftColor="brand.yellow"
            >
              <Text fontSize="sm" color="gray.600">Usuario Actual</Text>
              <Text fontWeight="bold" color="brand.blue" fontSize="md">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Rol actual: <strong>{user?.role_name || 'Sin rol'}</strong>
              </Text>
            </Box>

            {/* Select de roles */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold" color="brand.blue">
                Nuevo Rol
              </FormLabel>
              <Box
                as="select"
                w="100%"
                px={4}
                py={3}
                borderRadius="md"
                borderWidth="2px"
                borderColor="gray.300"
                bg="white"
                color="black"
                fontWeight="500"
                _hover={{ borderColor: 'brand.yellow' }}
                _focus={{
                  borderColor: 'brand.yellow',
                  boxShadow: '0 0 0 1px rgba(253, 176, 47, 0.5)',
                  outline: 'none',
                }}
                value={formData.role_id}
                onChange={(e : React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, role_id: e.target.value })
                }
              >
                <option value="">-- Seleccionar rol --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </Box>
            </FormControl>

            {/* Descripción del rol seleccionado */}
            {formData.role_id && (
              <Box
                bg="brand.lightGray"
                p={3}
                borderRadius="md"
                borderLeft="4px"
                borderLeftColor="brand.blue"
              >
                <Text fontSize="sm" fontWeight="600" color="brand.blue">
                  {roles.find(r => r.id === parseInt(formData.role_id))?.descripcion || 'Sin descripción disponible'  }
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button 
            variant="ghost" 
            onClick={onClose}
            _hover={{ bg: 'gray.100' }}
          >
            Cancelar
          </Button>
          <Button
            bg="brand.yellow"
            color="brand.blue"
            fontWeight="bold"
            isLoading={loading}
            onClick={handleSubmit}
            isDisabled={!formData.role_id}
            _hover={{ bg: 'brand.yellowTwo' }}
          >
            Cambiar Rol
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};