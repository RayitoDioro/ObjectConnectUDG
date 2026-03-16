import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalFooter, ModalBody, ModalCloseButton, Button, 
  Image, Text, VStack, HStack, Flex, Avatar, Heading, Center, Box 
} from "@chakra-ui/react";
import { type CardProps } from "@/types";

// Exportamos el tipo aquí para que Home, LostObjects, etc., puedan importarlo
export type ExtendedCardProps = CardProps & {
  description?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorId?: string; 
  category?: string;
  rawDate?: string;
};

// Definimos qué datos necesita recibir este Modal para funcionar
interface ObjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObj: ExtendedCardProps | null;
  currentUserId: string | null;
  onStartChat: (authorId: string) => void;
}

const ObjectDetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedObj, 
  currentUserId, 
  onStartChat 
}: ObjectDetailsModalProps) => {
  
  // Si no hay objeto seleccionado, no renderizamos nada
  if (!selectedObj) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter='blur(5px)' bg='blackAlpha.600' />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="lg" color="gray.700">Más información</ModalHeader>
        <ModalCloseButton mt={3} mr={3} />
        
        <ModalBody>
          <VStack align="stretch" spacing={5}>
            <Flex justify="space-between" align="center" borderBottom="1px solid #eee" pb={3}>
              <HStack spacing={3}>
                <Avatar size="sm" src={selectedObj.authorAvatarUrl} name={selectedObj.authorName} />
                <Text fontWeight="bold" fontSize="md" color="gray.800">{selectedObj.authorName}</Text>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color="gray.500">{selectedObj.date}</Text>
                <Text fontSize="xs" color="gray.500">{selectedObj.location}</Text>
              </VStack>
            </Flex>
            
            <Heading size="md" color="#002855">{selectedObj.title}</Heading>
            
            {/* Categoría */}
            {selectedObj.category && (
              <Text fontSize="sm" color="brand.blueLight" fontWeight="semibold">
                Categoría: {selectedObj.category}
              </Text>
            )}

            <Center w="100%" bg="gray.100" borderRadius="md" p={4}>
              <Image 
                src={selectedObj.imageUrl} 
                alt={selectedObj.altText} 
                maxH="280px" 
                objectFit="contain" 
                fallbackSrc="https://via.placeholder.com/400x300?text=Sin+Imagen" 
                borderRadius="sm" 
              />
            </Center>
            
            <Box>
              <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall">
                {selectedObj.description}
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          {selectedObj.authorId !== currentUserId ? (
            <Button 
              colorScheme="blue" 
              w="full" 
              size="lg" 
              borderRadius="md" 
              onClick={() => onStartChat(selectedObj.authorId as string)}
            >
              Crear chat con {selectedObj.authorName?.split(' ')[0] || "el usuario"}
            </Button>
          ) : (
            <Text w="full" textAlign="center" fontSize="sm" color="gray.500" fontStyle="italic">
              Esta es tu publicación.
            </Text>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ObjectDetailsModal;