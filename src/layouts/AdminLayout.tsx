import { Box, Flex, VStack, HStack, Heading, Button, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure, IconButton } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { type ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Usuarios', path: '/admin/usuarios' },
    { label: 'Roles', path: '/admin/roles' },
    { label: 'Permisos', path: '/admin/permisos' },
    { label: 'Posts', path: '/admin/posts' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavButton = ({ label, path }: { label: string; path: string }) => (
    <Button
      w="full"
      justifyContent="start"
      bg={isActive(path) ? 'brand.yellow' : 'transparent'}
      color={isActive(path) ? 'brand.blue' : 'white'}
      fontWeight={isActive(path) ? 'bold' : 'normal'}
      _hover={{ bg: 'brand.yellow', color: 'brand.blue' }}
      onClick={() => {
        navigate(path);
        onClose();
      }}
      px={4}
      py={3}
    >
      {label}
    </Button>
  );

  return (
    <Flex minH="100vh" bg="gray.100">
      {/* Sidebar Desktop */}
      <Box
        w="250px"
        bg="brand.blue"
        color="white"
        p={6}
        display={{ base: 'none', md: 'block' }}
        boxShadow="lg"
      >
        <Heading size="md" mb={8} color="brand.yellow">
          Panel Administrativo
        </Heading>
        <VStack spacing={2} align="stretch">
          {navItems.map((item) => (
            <NavButton key={item.path} label={item.label} path={item.path} />
          ))}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} overflow="auto">
        {/* Header Mobile */}
        <Box
          bg="brand.blue"
          color="white"
          p={4}
          display={{ base: 'flex', md: 'none' }}
          justifyContent="space-between"
          alignItems="center"
          boxShadow="md"
        >
          <Heading size="sm" color="brand.yellow">
            Panel Administrativo
          </Heading>
          <IconButton
            aria-label="Abrir menú"
            icon={<HamburgerIcon />}
            variant="outline"
            borderColor="brand.yellow"
            _hover={{ bg: 'brand.yellow', color: 'brand.blue' }}
            onClick={onOpen}
          />
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="brand.blue" color="white">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="2px" borderColor="brand.yellow">
              Navegación
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={2} align="stretch">
                {navItems.map((item) => (
                  <NavButton key={item.path} label={item.label} path={item.path} />
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Contenido */}
        <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};