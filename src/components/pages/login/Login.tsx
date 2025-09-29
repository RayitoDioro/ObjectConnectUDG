import { useState } from "react";
import { Box, Flex, Heading, Image, Input, Button, Text, VStack } from '@chakra-ui/react';
import udgLogo from '@/assets/leonUDG.png';
import googleLogo from '@/assets/google_logo.svg';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <Flex
            align='center'
            justify='center'
            minH='100vh'
            bg='brand.blue'
        >
            {/* container - elemento que contiene todo y se ajusta en base a wrapper */}
            <Box w='100%' maxW='420px' p='4'>
                {/* Card */}
                <Box bg='white' borderRadius='20px' boxShadow='xl' p={{ base: 6, md: 8 }}>
                    {/* CardHeader */}
                    <VStack spacing='4'>
                        <Image src={udgLogo} alt="Logo UDG León" boxSize='100px' />
                        <Heading as='h2' size='lg' color='brand.blue'>
                            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                        </Heading>
                    </VStack>

                    {/* cardContainer */}
                    <Box mt='6'>
                        <VStack as='form' spacing='4'>
                            <Input type='email' placeholder="Correo electrónico" size='lg' required />
                            
                            {!isLogin && (
                                <Input type='text' placeholder="Nombre completo" size='lg' />
                            )}

                            <Input type='password' placeholder="Contraseña" size='lg' required />

                            {/* Botón para inicio de sesión o registro por contraseña */}
                            <Button
                                type='submit'
                                w='100%'
                                bg='brand.blue'
                                color='white'
                                size='lg'
                                _hover={{ bg: 'brand.blueLight'}}
                            >
                                {isLogin ? 'Iniciar sesión' : 'Registrarme'}
                            </Button>   
                        </VStack>
                        
                        {/* Botón para inicio de sesión o registro por google */}
                        <Button
                            w='100%'
                            variant='outline'
                            mt='4'
                            size='lg'
                            leftIcon={<Image src={googleLogo} alt='Google' boxSize='20px' />}
                            _hover={{ bg: 'gray.200'}}
                        >
                            {isLogin ? 'Iniciar con Google' : 'Registrase con Google'}
                        </Button>

                        {/* toggleText y Link */}
                        <Text textAlign='center' fontSize='sm' color='gray.600' mt='6' >
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                            <Button
                                variant='link'
                                color='brand.blue'
                                fontWeight='bold'
                                onClick={toggleForm}
                            >
                                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
                            </Button>
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Flex>
    );
}

export default Login;