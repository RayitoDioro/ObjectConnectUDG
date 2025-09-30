import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/supabaseClient';

import udgLogo from '../../assets/logoUDG.png';
import { Box, Flex, Image, Button, MenuButton, Menu, MenuList, MenuItem, Avatar, HStack, Link, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, Divider } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Header = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  // Hook 
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  // Función para cerrar la sesión y redirigir
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/');
  };

  const linkHoverStyle = {
    color: 'brand.yellow',
    borderRadius: 'md',
    textDecoration: 'none'
  };

  return (
    <Box as='header' bg='brand.blue' color='white' py={6} px={{ base:4, md:8 }} shadow='md' borderBottom='4px' borderBottomColor='brand.yellow'>
      <Flex justify='space-between' align='center' maxW='1200px' mx='auto'>
        <RouterLink to='/'>
          <Image src={udgLogo} alt='Logo UDG' h={{ base: '45px', md: '60px' }} />
        </RouterLink>

        {/* Enlaces para navegar en computadora */}
        <HStack as='nav' spacing={8} display={{ base: 'none', md: 'flex'}}>
          <Link as={RouterLink} to="/lost-items" fontWeight='bold' _hover={linkHoverStyle}>
            Objetos perdidos
          </Link>
          <Link as={RouterLink} to="/found-items"  fontWeight='bold' _hover={linkHoverStyle}>
            Objetos encontrados
          </Link>
          <Link as={RouterLink} to="/publish-item" fontWeight='bold' _hover={linkHoverStyle}>
            Publicar objeto
          </Link>
        </HStack>
        
        <HStack>
          {/* Renderizado condicional usando la sesión */}
          <Box display={{ base: 'none', md: 'block'}}>
            {
              session ? (
                <Menu>
                  <MenuButton as={Button} rounded='full' variant='link' cursor='pointer' >
                    <Avatar 
                      size='md'
                      bg='brand.yellow'
                      color='brand.blue'
                      src={profile?.photo_profile_url || session?.user?.user_metadata?.avatar_url || ''}
                      name={profile ? `${profile.first_name} ${profile.last_name}` : (session?.user?.user_metadata?.full_name || session?.user?.email)}
                      referrerPolicy="no-referrer"
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem color='black' fontWeight='black'>
                      {profile ? `${profile.first_name} ${profile.last_name}` : (session?.user?.user_metadata?.full_name || session?.user?.email)}
                    </MenuItem>
                    <MenuItem color='black' fontWeight='bold'>Mi perfil</MenuItem>
                    <MenuItem color='red.500' fontWeight='bold' onClick={handleLogout}>
                      Cerrar sesión
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button as={RouterLink} to='/login' bg='brand.blueLight' color='white' _hover={{ bg: 'brand.blueTwo' }} >
                  Iniciar sesión
                </Button>
              )
            }
          </Box>

          {/* Botón de hamburguesa para móvil (se oculta en escritorio) */}
          <IconButton
            aria-label='Abrir menú de navegación'
            icon={<HamburgerIcon/>}
            variant='outline'
            borderColor='brand.yellow'
            _hover={{ bg: 'brand.yellow', color: 'brand.blue' }}
            display={{ base: 'flex', md: 'none' }}
            onClick={onDrawerOpen}
          />
        </HStack>
      </Flex>

      {/* Drawer (panel de navegación móvil) */}
      <Drawer isOpen={isDrawerOpen} placement='top' onClose={onDrawerClose}>
        <DrawerOverlay/>
        <DrawerContent bg='brand.blue' color='white'>
          <DrawerCloseButton/>
          <DrawerHeader borderBottomWidth='2px' borderColor='brand.yellow'>Navegación</DrawerHeader>
          <DrawerBody>
            <VStack>
              <Link as={RouterLink} to='/lost-items' onClick={onDrawerClose} fontSize='lg' _hover={linkHoverStyle}>Objetos perdidos</Link>
              <Link as={RouterLink} to='/found-items' onClick={onDrawerClose} fontSize='lg' _hover={linkHoverStyle}>Objetos encontrados</Link>
              <Link as={RouterLink} to='/publish-items' onClick={onDrawerClose} fontSize='lg' _hover={linkHoverStyle}>Publicar objetos</Link>

              <Divider/>

              {/* Lógica de sesión en el drawer */}
              {
                session ? (
                  <>
                    <Link as={RouterLink} to='/profile' onClick={onDrawerClose} fontSize='lg' fontWeight='bold' _hover={{ textDecoration: 'double', opacity: 0.6}}>Mi perfil</Link>
                    <Button 
                      onClick={() => {
                        handleLogout();
                        onDrawerClose();
                      }}
                      colorScheme='red'
                      w='full'
                    >
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <Button 
                    as={RouterLink} 
                    to='/login' onClick={onDrawerClose} 
                    bg='brand.yellow' 
                    color='white'
                    w='full' 
                    _hover={{ 
                      textDecoration: 'none', 
                      color: 'gray.300',
                      bg: 'brand.yellowTwo'
                    }} 
                    >
                      Iniciar sesión
                    </Button>
                )
              }
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header;

