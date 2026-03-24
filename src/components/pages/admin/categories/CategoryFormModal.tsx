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
  useToast,
  VStack,
} from '@chakra-ui/react';
import { supabaseClient } from '@/supabaseClient';
import type { Category } from '@/types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

export const CategoryFormModal = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || '' });
    } else {
      setFormData({ name: '' });
    }
  }, [category, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la categoría es requerido',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      if (category) {
        // Actualizar
        const { error } = await supabaseClient
          .from('categories')
          .update({ name: formData.name })
          .eq('id', category.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Categoría actualizada correctamente',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
      } else {
        // Crear
        const { error } = await supabaseClient
          .from('categories')
          .insert([{ name: formData.name }]);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Categoría creada correctamente',
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
        description: 'No se pudo guardar la categoría',
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
        <ModalHeader>{category ? 'Editar Categoría' : 'Nueva Categoría'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nombre de la Categoría</FormLabel>
              <Input
                placeholder="Ej: Electrónicos"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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