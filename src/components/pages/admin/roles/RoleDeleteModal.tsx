import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { supabaseClient } from '@/supabaseClient';
import type { Role } from '@/types';

interface RoleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export const RoleDeleteModal = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}: RoleDeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!role) return;

    try {
      setLoading(true);

      // Eliminar primero los permisos asociados
      await supabaseClient
        .from('roles_permisos')
        .delete()
        .eq('rol_id', role.id);

      // Luego eliminar el rol
      const { error } = await supabaseClient
        .from('Roles')
        .delete()
        .eq('id', role.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Rol eliminado correctamente',
        status: 'success',
        duration: 3,
        isClosable: true,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el rol',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Eliminar Rol</ModalHeader>
        <ModalBody>
          <Text>
            ¿Estás seguro de que quieres eliminar el rol{' '}
            <strong>{role?.role_name}</strong>? Esta acción no se puede deshacer.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            isLoading={loading}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};