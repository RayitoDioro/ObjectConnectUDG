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
  Select,
  useToast,
  VStack,
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
        description: 'Por favor completa todos los campos',
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
      } else {
        // Crear (nota: en producción, esto sería más complejo)
        toast({
          title: 'Info',
          description: 'La creación de usuarios debe hacerse a través del sistema de autenticación',
          status: 'info',
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
      <ModalContent>
        <ModalHeader color="brand.blue" fontWeight="bold">
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Rol</FormLabel>
              <Select
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({ ...formData, role_id: e.target.value })
                }
              >
                <option value="">Seleccionar rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            bg="brand.yellow"
            color="brand.blue"
            fontWeight="bold"
            isLoading={loading}
            onClick={handleSubmit}
          >
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};