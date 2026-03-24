import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { supabaseClient } from '@/supabaseClient';
import type { Permission } from '@/types';

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSuccess: () => void;
}

export const PermissionFormModal = ({
  isOpen,
  onClose,
  permission,
  onSuccess,
}: PermissionFormModalProps) => {
  const [formData, setFormData] = useState({ permiso: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (permission) {
      setFormData({
        permiso: permission.permiso || '',
        descripcion: permission.descripcion || '',
      });
    } else {
      setFormData({ permiso: '', descripcion: '' });
    }
  }, [permission, isOpen]);

  const handleSubmit = async () => {
    if (!formData.permiso.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del permiso es requerido',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      if (permission) {
        // Actualizar
        const { error } = await supabaseClient
          .from('permisos')
          .update({
            permiso: formData.permiso,
            descripcion: formData.descripcion,
          })
          .eq('id', permission.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Permiso actualizado correctamente',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
      } else {
        // Crear
        const { error } = await supabaseClient.from('permisos').insert([
          {
            permiso: formData.permiso,
            descripcion: formData.descripcion,
          },
        ]);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Permiso creado correctamente',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el permiso',
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
        <ModalHeader>{permission ? 'Editar Permiso' : 'Nuevo Permiso'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nombre del Permiso</FormLabel>
              <Input
                placeholder="Ej: view_users"
                value={formData.permiso}
                onChange={(e) =>
                  setFormData({ ...formData, permiso: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                placeholder="Descripción del permiso..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            bg="brand.blue"
            color="white"
            isLoading={loading}
            onClick={handleSubmit}
            _hover={{ bg: '#1A3258' }}
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};