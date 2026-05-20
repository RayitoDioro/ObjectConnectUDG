import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Link,
  useDisclosure,
  Box,
  Heading,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '@/context/AuthContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { isAdmin } = useAuth();
  const [activeModal, setActiveModal] = useState<'contact' | 'sitemap' | 'privacy' | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpenModal = (modal: 'contact' | 'sitemap' | 'privacy') => {
    setActiveModal(modal);
    onOpen();
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    onClose();
  };

  return (
    <>
      <footer className={styles.footer}>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Universidad de Guadalajara. Todos los derechos reservados.</p>
        <div className={styles.footerLinks}>
          <button 
            onClick={() => handleOpenModal('contact')}
            className={styles.footerButton}
          >
            Contacto
          </button>
          <button 
            onClick={() => handleOpenModal('sitemap')}
            className={styles.footerButton}
          >
            Mapa del sitio
          </button>
          <button 
            onClick={() => handleOpenModal('privacy')}
            className={styles.footerButton}
          >
            Aviso de Privacidad
          </button>
        </div>
      </footer>

      {/* Modal Contacto */}
      <Modal isOpen={isOpen && activeModal === 'contact'} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg" color="brand.blue">Contacto</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Box>
                <Text fontWeight="bold" color="brand.blue" mb={2}>
                  Universidad de Guadalajara
                </Text>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Text>
                    <strong>Email:</strong>{' '}
                    <Link href="mailto:objectconnectudg@gmail.com" isExternal color="brand.blue">
                      objectconnectudg@gmail.com <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Text>
                  <Text>
                    <strong>Teléfono:</strong> +52 (33) 34940677
                  </Text>
                  <Text>
                    <strong>Dirección:</strong> Avenida Principal, Guadalajara, Jalisco, México
                  </Text>
                </VStack>
              </Box>

              <Box w="full" borderTop="1px" borderColor="gray.200" pt={4}>
                <Text fontWeight="bold" color="brand.blue" mb={2}>
                  Departamento de Informática
                </Text>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Text>
                    <strong>Email:</strong>{' '}
                    <Link href="mailto:cdinf@cucei.udg.mx" isExternal color="brand.blue">
                      cdinf@cucei.udg.mx <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Text>
                  <Text>
                    <strong>Teléfono:</strong> +52 (33) 1378 5900 Ext: 27736
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Mapa del Sitio */}
      <Modal isOpen={isOpen && activeModal === 'sitemap'} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            <Heading size="lg" color="brand.blue">Mapa del Sitio</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="start">
              <Box>
                <Heading size="sm" color="brand.blue" mb={3}>
                  Principal
                </Heading>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Link href="/" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Inicio</Link>
                  <Link href="/objetos-perdidos" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Objetos Perdidos</Link>
                  <Link href="/objetos-encontrados" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Objetos Encontrados</Link>
                  <Link href="/publicar-objeto" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Publicar objeto</Link>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={3}>
                  Usuario
                </Heading>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Link href="/perfil" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Mi Perfil y posts</Link>
                  <Link href="/settings" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Configuración</Link>
                </VStack>
              </Box>

              {/* Sección de Admin - Solo visible para administradores */}
              {isAdmin && (
                <Box>
                  <Heading size="sm" color="brand.blue" mb={3}>
                    Administración
                  </Heading>
                  <VStack spacing={2} align="start" fontSize="sm">
                    <Link href="/admin" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Dashboard</Link>
                    <Link href="/admin/usuarios" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Usuarios</Link>
                    <Link href="/admin/roles" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Roles</Link>
                    <Link href="/admin/permisos" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Permisos</Link>
                    <Link href="/admin/categorias" _hover={{ color: 'brand.yellow', textDecoration: 'none' }} transition="all 0.2s">Categorías</Link>
                  </VStack>
                </Box>
              )}

              <Box>
                <Heading size="sm" color="brand.blue" mb={3}>
                  Legal
                </Heading>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Link cursor="pointer" onClick={() => {
                    handleCloseModal();
                    setTimeout(() => handleOpenModal('privacy'), 100);
                  }}
                    _hover={{ color: 'brand.yellow', textDecoration: 'none' }}
                      transition="all 0.2s"
                  >
                    Aviso de Privacidad
                  </Link>
                  <Link cursor="pointer" onClick={() => {
                    handleCloseModal();
                    setTimeout(() => handleOpenModal('contact'), 100);
                  }}
                    _hover={{ color: 'brand.yellow', textDecoration: 'none' }}
                      transition="all 0.2s"
                  >
                    Contacto
                  </Link>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Aviso de Privacidad */}
      <Modal isOpen={isOpen && activeModal === 'privacy'} onClose={handleCloseModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            <Heading size="lg" color="brand.blue">Aviso de Privacidad</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start" fontSize="sm" lineHeight="1.8">
              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  1. Responsable de los datos personales
                </Heading>
                <Text>
                  La Universidad de Guadalajara es responsable de los datos personales que recopilamos a través de esta plataforma y se compromete a proteger la privacidad de nuestros usuarios.
                </Text>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  2. Datos que recopilamos
                </Heading>
                <Text>
                  Recopilamos información personal como nombre, email, fotografía de perfil y rol de usuario para mejorar la experiencia en la plataforma.
                </Text>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  3. Uso de los datos
                </Heading>
                <Text>
                  Utilizamos los datos recopilados para:
                </Text>
                <VStack spacing={1} align="start" ml={4} mt={2}>
                  <Text>• Gestionar cuentas de usuario</Text>
                  <Text>• Enviar notificaciones importantes</Text>
                  <Text>• Mejorar la calidad del servicio</Text>
                  <Text>• Cumplir obligaciones legales</Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  4. Seguridad de datos
                </Heading>
                <Text>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger los datos personales contra acceso no autorizado, alteración o pérdida.
                </Text>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  5. Derechos del usuario
                </Heading>
                <Text>
                  Tienes derecho a:
                </Text>
                <VStack spacing={1} align="start" ml={4} mt={2}>
                  <Text>• Acceder a tus datos personales</Text>
                  <Text>• Solicitar corrección de datos inexactos</Text>
                  <Text>• Solicitar eliminación de datos</Text>
                  <Text>• Revocar el consentimiento</Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" color="brand.blue" mb={2}>
                  6. Contacto
                </Heading>
                <Text>
                  Para consultas sobre privacidad, contáctanos en:{' '}
                  <Link href="mailto:objectconnectudg@gmail.com" isExternal color="brand.blue">
                    objectconnectudg@gmail.com
                  </Link>
                </Text>
              </Box>

              <Box pt={4} borderTop="1px" borderColor="gray.200">
                <Text fontSize="xs" color="gray.500">
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Footer;