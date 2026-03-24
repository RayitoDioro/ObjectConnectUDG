import { Box, Flex, VStack, HStack, Heading, Button, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure, IconButton } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, ArrowBackIcon, CloseIcon } from '@chakra-ui/icons';
import { type ReactNode, useState } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Usuarios', path: '/admin/usuarios' },
    { label: 'Roles', path: '/admin/roles' },
    { label: 'Permisos', path: '/admin/permisos' },
    { label: 'Permisos de rol', path: '/admin/rolePermisos' },
    { label: 'Categorias', path: '/admin/categorias' },
    // { label: 'Posts', path: '/admin/posts' },
    {label: "Métricas ML", path: "/admin/metricas" }
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavButton = ({ label, path }: { label: string; path: string }) => (
    <Button
      w="full"
      justifyContent="start"
      bg={isActive(path) ? "brand.yellow" : "transparent"}
      color={isActive(path) ? "brand.blue" : "white"}
      fontWeight={isActive(path) ? "bold" : "normal"}
      _hover={{ bg: "brand.yellow", color: "brand.blue" }}
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
        w={isSidebarCollapsed ? '0px' : '250px'}
        bg="brand.blue"
        color="white"
        p={isSidebarCollapsed ? 0 : 6}
        display={{ base: 'none', md: 'block' }}
        boxShadow="lg"
        transition="all 0.3s ease-in-out"
        overflow="hidden"
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
        {/* Header Desktop */}
      <Box
        bg="brand.blue"
        color="white"
        p={4}
        display={{ base: 'none', md: 'flex' }}
        justifyContent="space-between"
        alignItems="center"
        boxShadow="md"
      >
        <IconButton
            aria-label={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            icon={isSidebarCollapsed ? <HamburgerIcon /> : <CloseIcon />}
            bg="brand.yellow"
            color="brand.blue"
            _hover={{ bg: 'white', color: 'brand.blue' }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            fontWeight="bold"
          />
        <IconButton
          aria-label="Regresar a la aplicación"
          icon={<ArrowBackIcon w={6} h={6} />}
          bg="brand.yellow"
          color="brand.blue"
          _hover={{ bg: 'white', color: 'brand.blue' }}
          onClick={() => navigate('/')}
          fontWeight="bold"
        />
      </Box>

        {/* Header Mobile */}
        <Box
          bg="brand.blue"
          color="white"
          p={4}
          display={{ base: "flex", md: "none" }}
          justifyContent="space-between"
          alignItems="center"
          boxShadow="md"
        >
          <HStack spacing={2}>
            <IconButton
              aria-label="Regresar a la aplicación"
              icon={<ArrowBackIcon w={5} h={5} />}
              bg="brand.yellow"
              color="brand.blue"
              _hover={{ bg: 'white', color: 'brand.blue' }}
              onClick={() => navigate('/')}
              size="sm"
            />
            <Heading size="sm" color="brand.yellow">
              Panel Administrativo
            </Heading>
          </HStack>
          <IconButton
            aria-label="Abrir menú"
            icon={<HamburgerIcon />}
            variant="outline"
            borderColor="brand.yellow"
            _hover={{ bg: "brand.yellow", color: "brand.blue" }}
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
                  <NavButton
                    key={item.path}
                    label={item.label}
                    path={item.path}
                  />
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
