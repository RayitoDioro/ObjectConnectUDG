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
import type { Permission } from '@/types';

interface PermissionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSuccess: () => void;
}

export const PermissionDeleteModal = ({
  isOpen,
  onClose,
  permission,
  onSuccess,
}: PermissionDeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!permission) return;

    try {
      setLoading(true);

      // Primero eliminar relaciones en roles_permisos
      await supabaseClient
        .from('roles_permisos')
        .delete()
        .eq('permiso_id', permission.id);

      // Luego eliminar el permiso
      const { error } = await supabaseClient
        .from('permisos')
        .delete()
        .eq('id', permission.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Permiso eliminado correctamente',
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
        description: 'No se pudo eliminar el permiso',
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
        <ModalHeader>Eliminar Permiso</ModalHeader>
        <ModalBody>
          <Text>
            ¿Estás seguro de que quieres eliminar el permiso{' '}
            <strong>{permission?.permiso}</strong>? Esta acción no se puede deshacer.
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