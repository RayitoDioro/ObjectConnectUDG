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
import type { Role } from '@/types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export const RoleFormModal = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}: RoleFormModalProps) => {
  const [formData, setFormData] = useState({ role_name: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name || '',
        descripcion: role.descripcion || '',
      });
    } else {
      setFormData({ role_name: '', descripcion: '' });
    }
  }, [role, isOpen]);

  const handleSubmit = async () => {
    if (!formData.role_name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del rol es requerido',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      if (role) {
        // Actualizar
        const { error } = await supabaseClient
          .from('Roles')
          .update({
            role_name: formData.role_name,
            descripcion: formData.descripcion,
          })
          .eq('id', role.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Rol actualizado correctamente',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
      } else {
        // Crear
        const { error } = await supabaseClient.from('Roles').insert([
          {
            role_name: formData.role_name,
            descripcion: formData.descripcion,
          },
        ]);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Rol creado correctamente',
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
        description: 'No se pudo guardar el rol',
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
        <ModalHeader>{role ? 'Editar Rol' : 'Nuevo Rol'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nombre del Rol</FormLabel>
              <Input
                placeholder="Ej: Administrador"
                value={formData.role_name}
                onChange={(e) =>
                  setFormData({ ...formData, role_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                placeholder="Descripción del rol..."
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
            bg="#00569c"
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