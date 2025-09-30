import { useState } from "react";
import { Box, Flex, Heading, Image, Input, Button, Text, VStack, useToast } from '@chakra-ui/react';
import udgLogo from '@/assets/leonUDG.png';
import googleLogo from '@/assets/google_logo.svg';
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "@/supabaseClient";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const navigate = useNavigate();
    const toast = useToast();

    // Lógica se inicio de sesión con contraseña
    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            if(isLogin){
                // Lógica para iniciar sesión
                const {error} = await supabaseClient.auth.signInWithPassword({email, password});

                if(error) {
                    throw error;
                }
                navigate('/');
            } else {
                // Lógica para el registro
                const {error} =  await supabaseClient.auth.signUp({
                    email, 
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName
                        }
                    }
                });

                if(error) {
                    throw error;
                }

                // Cuadro de diálogo que envía mensaje de éxito al usuario
                toast({
                    title: 'Cuenta creada con éxito.',
                    description: 'Revisa tu bandeja de entrada para verificar tu cuenta.',
                    status: 'success',
                    'duration': 5000,
                    isClosable: true
                });
            }

        } catch(error: unknown) {
            showAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica se inicio de sesión con Google
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const {error} = await supabaseClient.auth.signInWithOAuth({
                provider: 'google'
            });

            if(error) throw error;
        } catch(error: unknown) {
            showAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    // Mensaje de error que se repite
    const showAuthError = (error: unknown) => {
        let errorMessage = 'Ocurrió un error desconocido';
        if(typeof error === 'object' && error !== null) {
            const err = error as {error_description?: string, message?: string};
            errorMessage = err.error_description || err.message || errorMessage;
        }
        toast({
            title: 'Error de autenticación',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true
        })
    };

    return (
        // Wrapper - fondo azul y alineamiento de elementos
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
                        <VStack as='form' spacing='4' onSubmit={handleAuth}>
                            <Input type='email' placeholder="Correo electrónico" size='lg' required onChange={(e) => setEmail(e.target.value)} />
                            
                            {!isLogin && (
                                <>
                                    <Input type='text' placeholder="Nombre" size='lg' onChange={(e) => setFirstName(e.target.value)} />
                                    <Input type='text' placeholder="Apellido" size='lg' onChange={(e) => setLastName(e.target.value)} />
                                </>
                            )}

                            <Input type='password' placeholder="Contraseña" size='lg' required onChange={(e) => setPassword(e.target.value)} />

                            {/* Botón para inicio de sesión o registro por contraseña */}
                            <Button
                                type='submit'
                                w='100%'
                                bg='brand.blue'
                                color='white'
                                size='lg'
                                _hover={{ bg: 'brand.blueLight'}}
                                isLoading={loading}
                                loadingText={isLogin ? 'Iniciando' : 'Registrando...'}
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
                            onClick={handleGoogleLogin}
                            isLoading={loading}
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