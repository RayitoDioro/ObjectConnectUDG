import { useState } from "react";
import { Box, Flex, Heading, Image, Input, Button, Text, VStack, useToast, Collapse } from '@chakra-ui/react';
import udgLogo from '@/assets/leonUDG.png';
import googleLogo from '@/assets/google_logo.svg';
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "@/supabaseClient";
import { validatePassword } from "@/utils/passwordValidation";
import { translateAuthError } from "@/utils/authErrors";
import { PasswordRequirementsDisplay } from "@/components/common/PasswordRequirements";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPasswordReqs, setShowPasswordReqs] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false); //

    // Validar requisitos de contraseña
    const passwordRequirements = validatePassword(password);

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
            // Si estamos en modo reset, solo enviar email
            if (isResettingPassword) {
                await handlePasswordReset();
                return;
            }

            if(isLogin){
                // Lógica para iniciar sesión
                const {error} = await supabaseClient.auth.signInWithPassword({email, password});

                if(error) {
                    throw error;
                }
                navigate('/');
            } else {
                // Lógica para el registro
                const {data, error} =  await supabaseClient.auth.signUp({
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

                // verificación de envío de correo
                const userCreated = data.user;
                const emailVerified = data.user?.user_metadata.email_verified;

                // Usuario ya confirmado - se intentó registrar con un correo ya confirmado
                if(userCreated && emailVerified === undefined){
                    toast({
                        title: 'Cuenta ya confirmada.',
                        description: 'Ya puedes iniciar sesión con tu correo y contraseña.',
                        status: 'info',
                        duration: 5000,
                        isClosable: true
                    });
                    
                    setIsLogin(true);
                }
                // Usuario necesita confirmar correo - nuevo usuario o se intentó registrar uno ya registrado
                else if(userCreated && emailVerified === false){
                    toast({
                        title: 'Revisa tu correo electrónico.',
                        description: 'Te hemos enviado un enlace de verificación. Si ya te habías registrado, se enviará un nuevo enlace.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true
                    });

                    setIsLogin(true);
                }
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

    // Lógica para recuperación de contraseña
    const handlePasswordReset = async () => {
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            toast({
                title: 'Correo enviado',
                description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                status: 'success',
                duration: 7000,
                isClosable: true
            });
            
            setIsResettingPassword(false); // Volver a login normal
        } catch (error: unknown) {
            showAuthError(error);
        }
    };    

    // Mensaje de error mejorado
    const showAuthError = (error: unknown) => {
        console.log(error);
        let errorMessage = 'Ocurrió un error desconocido';
        if(typeof error === 'object' && error !== null) {
            const err = error as {error_description?: string, message?: string};
            const originalMessage = err.error_description || err.message || errorMessage;
            errorMessage = translateAuthError(originalMessage);
        }
        toast({
            title: 'Error de autenticación',
            description: errorMessage,
            status: 'error',
            duration: 7000,
            isClosable: true
        })
    };

    return (
        <Flex
            justify='center'
            minH='100vh'
            bg='brand.blue'
            overflow='auto'
            sx={{
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    borderRadius: '4px',
                },
                // desktop: mostrar solo al hacer hover sobre la scrollbar
                '@media (hover: hover) and (pointer: fine)': {
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    },
                },
                // mobile: ocultar completamente
                '@media (hover: none) and (pointer: coarse)': {
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
            }}
        >
            {/* container - elemento que contiene todo y se ajusta en base a wrapper */}
            <Box w='100%' maxW='420px' p='4' my='auto'>
                {/* Card */}
                <Box bg='white' borderRadius='20px' boxShadow='xl' p={{ base: 6, md: 8 }}>
                    {/* CardHeader */}
                    <VStack spacing='4'>
                        <Image src={udgLogo} alt="Logo UDG León" boxSize='100px' />
                        <Heading as='h2' size='lg' color='brand.blue' textAlign='center'>
                            {
                                isResettingPassword ? 'Restablecer contraseña' :
                                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                            }
                        </Heading>
                    </VStack>

                    {/* cardContainer */}
                    <Box mt='6'>
                        <VStack as='form' spacing='4' onSubmit={handleAuth}>
                            <Input type='email' placeholder="Correo electrónico" size='lg' required onChange={(e) => setEmail(e.target.value)} />
                            
                            {!isLogin && (
                                <>
                                    <Input type='text' placeholder="Nombre" size='lg' required onChange={(e) => setFirstName(e.target.value)} />
                                    <Input type='text' placeholder="Apellido" size='lg' required onChange={(e) => setLastName(e.target.value)} />
                                </>
                            )}

                            {/* Solo muestra password si no estamos en modo reset */}
                            {!isResettingPassword && (
                                <Input 
                                    type='password' 
                                    placeholder="Contraseña" 
                                    size='lg' 
                                    required 
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => !isLogin && setShowPasswordReqs(true)}
                                    onBlur={() => setShowPasswordReqs(false)}
                                />
                            )}

                            {/* Botón de recuperación de contraseña */}
                            {isLogin && !isResettingPassword && (
                                <Button
                                    variant='unstyled'
                                    color='brand.blue'
                                    size='sm'
                                    onClick={() => setIsResettingPassword(true)}
                                    alignSelf='flex-end'
                                    mt='-2'
                                >
                                    ¿Olvidaste tu contraseña?
                                </Button>
                            )}

                            {/* Botón cancelar en modo reset */}
                            {isResettingPassword && (
                                <Button
                                    variant='unstyled'
                                    color='brand.blue'
                                    size='sm'
                                    onClick={() => setIsResettingPassword(false)}
                                    alignSelf='flex-end'
                                    mt='-2'
                                >
                                    Volver al inicio de sesión
                                </Button>
                            )}

                            {/* Indicadores de requisitos de contraseña - solo en registro */}
                            {!isLogin && !isResettingPassword && (
                                <Collapse in={showPasswordReqs || password.length > 0} animateOpacity>
                                    <PasswordRequirementsDisplay requirements={passwordRequirements} />
                                </Collapse>
                            )}

                            {/* Botón para inicio de sesión o registro por contraseña */}
                            <Button
                                type='submit'
                                w='100%'
                                bg='brand.blue'
                                color='white'
                                size='lg'
                                _hover={{ bg: 'brand.blueLight'}}
                                isLoading={loading}
                                loadingText={
                                    isResettingPassword
                                    ? 'Enviando...'
                                    : (isLogin ? 'Iniciando' : 'Registrando...')}
                            >
                                {isResettingPassword
                                ? 'Enviar enlace de recuperación'
                                : isLogin ? 'Iniciar sesión' : 'Registrarme'}
                            </Button>   
                        </VStack>
                        
                        {/* Botón para inicio de sesión o registro por google */}
                        {!isResettingPassword && (
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
                        )}

                        {/* toggleText y Link */}
                        {!isResettingPassword && (
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
                        )}
                    </Box>
                </Box>
            </Box>
        </Flex>
    );
}

export default Login;