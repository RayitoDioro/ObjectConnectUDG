import { useState } from "react";
import { Box, Flex, Heading, Image, Input, Button, Text, VStack, useToast, List, ListItem, ListIcon, Collapse } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
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
    const [showPasswordReqs, setShowPasswordReqs] = useState(false);

    // Validar requisitos de contraseña
    const passwordRequirements = {
        minLength: password.length >= 6,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=[\]{}:<>?.,/~]/.test(password)
    };

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

    // Función para traducir errores de Supabase al español
    const translateAuthError = (errorMessage: string): string => {
        // Errores de contraseña
        if (errorMessage.includes('Password should be at least') || errorMessage.includes('password'))
            return 'La contraseña debe cumplir los siguientes requisitos: mínimo 6 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (!@#$%^&*).';
        else if (errorMessage.includes('Password should contain'))
            return 'La contraseña sigue sin cumplir con todos los requisitos de seguridad. Revisa los indicadores.';

        // Error de email ya registrado
        if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
            return 'Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.';
        }

        // Error de email inválido
        if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid email')) {
            return 'El correo electrónico no es válido. Verifica que esté escrito correctamente.';
        }

        // Error de credenciales incorrectas
        if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid credentials')) {
            return 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
        }

        // Error de email no confirmado
        if (errorMessage.includes('Email not confirmed')) {
            return 'Debes confirmar tu correo electrónico. Revisa tu bandeja de entrada y spam.';
        }

        // Error de rate limit
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
            return 'Demasiados intentos. Por favor, espera una hora antes de intentar nuevamente.';
        }

        // Si no coincide con ningún patrón, devolver mensaje genérico
        return 'Ocurrió un error inesperado. Por favor, verifica tus datos e intenta nuevamente.';
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
        >
            {/* container - elemento que contiene todo y se ajusta en base a wrapper */}
            <Box w='100%' maxW='420px' p='4' my='auto'>
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
                                    <Input type='text' placeholder="Nombre" size='lg' required onChange={(e) => setFirstName(e.target.value)} />
                                    <Input type='text' placeholder="Apellido" size='lg' required onChange={(e) => setLastName(e.target.value)} />
                                </>
                            )}

                            <Input 
                                type='password' 
                                placeholder="Contraseña" 
                                size='lg' 
                                required 
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => !isLogin && setShowPasswordReqs(true)}
                                onBlur={() => setShowPasswordReqs(false)}
                            />

                            {/* Indicadores de requisitos de contraseña - solo en registro */}
                            {!isLogin && (
                                <Collapse in={showPasswordReqs || password.length > 0} animateOpacity>
                                    <Box 
                                        w='100%' 
                                        bg='gray.50' 
                                        p='4' 
                                        borderRadius='md' 
                                        border='1px solid' 
                                        borderColor='gray.200'
                                    >
                                        <Text fontSize='xs' fontWeight='bold' color='gray.600' mb='2'>
                                            Requisitos de contraseña:
                                        </Text>
                                        <List spacing='1' fontSize='xs'>
                                            <ListItem color={passwordRequirements.minLength ? 'green.600' : 'gray.500'}>
                                                <ListIcon 
                                                    as={passwordRequirements.minLength ? CheckCircleIcon : WarningIcon} 
                                                    color={passwordRequirements.minLength ? 'green.500' : 'gray.400'}
                                                />
                                                Mínimo 6 caracteres
                                            </ListItem>
                                            <ListItem color={passwordRequirements.hasLowercase ? 'green.600' : 'gray.500'}>
                                                <ListIcon 
                                                    as={passwordRequirements.hasLowercase ? CheckCircleIcon : WarningIcon} 
                                                    color={passwordRequirements.hasLowercase ? 'green.500' : 'gray.400'}
                                                />
                                                Al menos una letra minúscula (a-z)
                                            </ListItem>
                                            <ListItem color={passwordRequirements.hasUppercase ? 'green.600' : 'gray.500'}>
                                                <ListIcon 
                                                    as={passwordRequirements.hasUppercase ? CheckCircleIcon : WarningIcon} 
                                                    color={passwordRequirements.hasUppercase ? 'green.500' : 'gray.400'}
                                                />
                                                Al menos una letra MAYÚSCULA (A-Z)
                                            </ListItem>
                                            <ListItem color={passwordRequirements.hasNumber ? 'green.600' : 'gray.500'}>
                                                <ListIcon 
                                                    as={passwordRequirements.hasNumber ? CheckCircleIcon : WarningIcon} 
                                                    color={passwordRequirements.hasNumber ? 'green.500' : 'gray.400'}
                                                />
                                                Al menos un número (0-9)
                                            </ListItem>
                                            <ListItem color={passwordRequirements.hasSpecial ? 'green.600' : 'gray.500'}>
                                                <ListIcon 
                                                    as={passwordRequirements.hasSpecial ? CheckCircleIcon : WarningIcon} 
                                                    color={passwordRequirements.hasSpecial ? 'green.500' : 'gray.400'}
                                                />
                                                Al menos un carácter especial (!@#$%^&*)
                                            </ListItem>
                                        </List>
                                    </Box>
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