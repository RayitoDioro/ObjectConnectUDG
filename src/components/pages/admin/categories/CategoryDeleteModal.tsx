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
import type { Category } from '@/types';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

export const CategoryDeleteModal = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryDeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!category) return;

    try {
      setLoading(true);

      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Categoría eliminada correctamente',
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
        description: 'No se pudo eliminar la categoría',
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
        <ModalHeader>Eliminar Categoría</ModalHeader>
        <ModalBody>
          <Text>
            ¿Estás seguro de que quieres eliminar la categoría{' '}
            <strong>{category?.name}</strong>? Esta acción no se puede deshacer.
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