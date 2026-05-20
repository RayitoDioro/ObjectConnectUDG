import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/supabaseClient';

import udgLogo from '../../assets/logoUDG.png';
import { Box, Flex, Image, Button, MenuButton, Menu, MenuList, MenuItem, Avatar, HStack, Link, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, Divider } from '@chakra-ui/react';
import { HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import styles from './Header.module.css';

const Header = () => {
  const { session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Hook 
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  // Función para cerrar la sesión y redirigir
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <Box as='header' bg='brand.blue' color='white' py={6} px={{ base:4, md:8 }} shadow='md' borderBottom='4px' borderBottomColor='brand.yellow'>
      <Flex justify='space-between' align='center' maxW='1200px' mx='auto'>
        <RouterLink to='/'>
          <Image src={udgLogo} alt='Logo UDG' h={{ base: '45px', md: '60px' }}
          transition="all 0.3s ease" _hover={{ transform: 'scale(1.05)' }} />
        </RouterLink>

        {/* Enlaces para navegar en computadora */}
        <HStack as='nav' spacing={8} display={{ base: 'none', md: 'flex'}}>
          <Link as={RouterLink} to="/objetos-perdidos" className={styles.navLink} _hover={{ textDecoration: 'none' }}>
            Objetos perdidos
          </Link>
          <Link as={RouterLink} to="/objetos-encontrados"  className={styles.navLink} _hover={{ textDecoration: 'none' }}>
            Objetos encontrados
          </Link>
          <Link as={RouterLink} to="/publicar-objeto" className={styles.navLink} _hover={{ textDecoration: 'none' }}>
            Publicar objeto
          </Link>
          {session && (
            <Link as={RouterLink} to="/Chats" className={styles.navLink} _hover={{ textDecoration: 'none' }}>
              Chats
            </Link>
          )}
        </HStack>
        
        <HStack>
          {/* Renderizado condicional usando la sesión */}
          <Box display={{ base: 'none', md: 'block'}}>
            {
              session ? (
                <Menu>
                  <MenuButton 
                    as={Button} 
                    rounded='full' 
                    variant='link' 
                    cursor='pointer' 
                    _hover={{transform: 'scale(1.1)' }}
                    transition="all 0.3s ease"
                  >
                    <Box
                      border="4px solid"
                      borderRadius="full"
                      borderColor="brand.yellow"
                      pointerEvents="none"
                      p={0}
                    >
                      <Avatar 
                        size='md'
                        bg='brand.yellow'
                        color='brand.blue'
                        src={profile?.photo_profile_url || session?.user?.user_metadata?.avatar_url || ''}
                        name={profile ? `${profile.first_name} ${profile.last_name}` : (session?.user?.user_metadata?.full_name || session?.user?.email)}
                        referrerPolicy="no-referrer"
                      />
                    </Box>
                  </MenuButton>
                  <MenuList>
                    <MenuItem color='black' fontWeight='black'>
                      {profile ? `${profile.first_name} ${profile.last_name}` : (session?.user?.user_metadata?.full_name || session?.user?.email)}
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/perfil" color='black' fontWeight='bold'>Mi perfil</MenuItem>
                    <MenuItem as={RouterLink} to="/settings" color='black' fontWeight='bold'>
                      Configuración
                    </MenuItem>
                    <MenuItem color='red.500' fontWeight='bold' onClick={handleLogout}>
                      Cerrar sesión
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button as={RouterLink} to='/login' bg='brand.blueLight' color='white' _hover={{ bg: 'brand.blueTwo' }} 
                transition="all 0.3s ease">
                  Iniciar sesión
                </Button>
              )
            }
          </Box>
          {/* Botón admin - solo aparece si sesión iniciada y es un admin */}
          {session && isAdmin && (
            <IconButton
              aria-label='Panel Administrativo'
              icon={<SettingsIcon/>}
              onClick={handleAdminClick}
              bg='brand.yellow'
              color='brand.blue'
              _hover={{ bg: 'brand.yellowTwo', transform: 'scale(1.1)' }}
              _active={{ transform: 'scale(0.95)' }}
              display={{ base: 'none', md: 'flex' }}
              title='Panel Administrativo'
              transition="all 0.3s ease"
            />
          )}

          {/* Botón de hamburguesa para móvil (se oculta en escritorio) */}
          <IconButton
            aria-label='Abrir menú de navegación'
            icon={<HamburgerIcon/>}
            variant='outline'
            borderColor='brand.yellow'
            _hover={{ bg: 'brand.yellow', color: 'brand.blue' }}
            display={{ base: 'flex', md: 'none' }}
            onClick={onDrawerOpen}
            transition="all 0.3s ease"
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
            <VStack spacing={2} align="stretch" py={2}>
              <Link as={RouterLink} to='/objetos-perdidos' onClick={onDrawerClose} className={styles.drawerLink} _hover={{ textDecoration: 'none' }}>Objetos perdidos</Link>
              <Link as={RouterLink} to='/objetos-encontrados' onClick={onDrawerClose} className={styles.drawerLink} _hover={{ textDecoration: 'none' }}>Objetos encontrados</Link>
              <Link as={RouterLink} to='/publicar-objeto' onClick={onDrawerClose} className={styles.drawerLink} _hover={{ textDecoration: 'none' }}>Publicar objeto</Link>
              {session && (<Link as={RouterLink} to='/Chats' onClick={onDrawerClose} className={styles.drawerLink} _hover={{ textDecoration: 'none' }}>Chats</Link>)}

              <Divider my={2}/>

              {/* Lógica de sesión en el drawer */}
              {
                session ? (
                  <>
                    {isAdmin && (
                      <>
                        <Link as={RouterLink} to='/admin' onClick={onDrawerClose} className={`${styles.drawerLink} ${styles.adminDrawerLink}`}>Panel Administrativo</Link>
                        <Divider my={2}/>
                      </>
                    )}
                    <Link as={RouterLink} to='/perfil' onClick={onDrawerClose} className={styles.drawerLink}>Mi perfil</Link>
                    <Link as={RouterLink} to='/settings' onClick={onDrawerClose} className={styles.drawerLink}>
                      Configuración
                    </Link>
                    <Button 
                      onClick={() => {
                        handleLogout();
                        onDrawerClose();
                      }}
                      colorScheme='red'
                      w='full'
                      mt={4}
                    >
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <Button 
                    as={RouterLink} 
                    to='/login' onClick={onDrawerClose} 
                    bg='brand.yellow' 
                    color='brand.blue'
                    w='full' 
                    fontWeight="bold"
                    _hover={{ 
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