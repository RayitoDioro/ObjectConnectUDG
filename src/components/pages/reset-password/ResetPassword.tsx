import { useState, useEffect } from 'react';
import { Box, Flex, Heading, Input, Button, VStack, useToast, Collapse, Image } from '@chakra-ui/react';
import { useNavigate, useSearchParams  } from 'react-router-dom';
import { supabaseClient } from '@/supabaseClient';
import { validatePassword, isPasswordValid } from '@/utils/passwordValidation';
import { translateAuthError } from '@/utils/authErrors';
import { PasswordRequirementsDisplay } from '@/components/common/PasswordRequirements';
import udgLogo from '@/assets/leonUDG.png';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordReqs, setShowPasswordReqs] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams(); 

    const passwordRequirements = validatePassword(newPassword);

    // Efecto para capturar errores de la URL (hash fragments y query params)
    useEffect(() => {
        // Verificar hash fragments (#) - Supabase usa esto
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        // Verificar query params (?) - por si acaso
        const error = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (error) {
            let errorMessage = 'El enlace de recuperación no es válido.';

            // Traducir errores específicos
            if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
                errorMessage = 'El enlace de recuperación ha expirado. Los enlaces son válidos por 1 hora. Solicita uno nuevo desde la página de inicio de sesión.';
            } else if (errorCode === 'access_denied' || error === 'access_denied') {
                errorMessage = 'El enlace de recuperación no es válido o ya fue utilizado. Solicita uno nuevo si aún necesitas cambiar tu contraseña.';
            } else if (errorDescription) {
                errorMessage = translateAuthError(decodeURIComponent(errorDescription));
            }

            toast({
                title: 'Enlace no válido',
                description: errorMessage,
                status: 'error',
                duration: 8000,
                isClosable: true,
                position: 'bottom'
            });

            // Limpiar los parámetros de la URL
            window.location.hash = '';
            setSearchParams({});

            // Redirigir a login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    }, [searchParams, toast, navigate, setSearchParams]);

    // Efecto adicional para escuchar eventos de auth de Supabase
    useEffect(() => {
        const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, session);
            
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery detected - valid link');
            }
        });
        
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [toast, navigate]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que la contraseña cumpla todos los requisitos
        if (!isPasswordValid(passwordRequirements)) {
            toast({
                title: 'Contraseña no válida',
                description: 'La contraseña debe cumplir todos los requisitos de seguridad.',
                status: 'warning',
                duration: 5000,
                isClosable: true
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast({
                title: 'Contraseña actualizada',
                description: 'Tu contraseña ha sido restablecida con éxito.',
                status: 'success',
                duration: 5000,
                isClosable: true
            });

            navigate('/login');
        } catch (error: any) {
            const errorMessage = translateAuthError(error.message || 'No se pudo restablecer la contraseña.');
            toast({
                title: 'Error',
                description: errorMessage,
                status: 'error',
                duration: 7000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex justify='center' minH='100vh' bg='brand.blue' overflow='auto'>
            <Box w='100%' maxW='420px' p='4' my='auto'>
                <Box bg='white' borderRadius='20px' boxShadow='xl' p={{ base: 6, md: 8 }}>
                    <VStack spacing='4'>
                        <Image src={udgLogo} alt="Logo UDG León" boxSize='100px' />
                        <Heading as='h2' size='lg' color='brand.blue'>
                            Restablecer Contraseña
                        </Heading>
                    </VStack>

                    <VStack as='form' spacing='4' onSubmit={handleResetPassword} mt='6'>
                        <Input
                            type='password'
                            placeholder='Nueva contraseña'
                            size='lg'
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setShowPasswordReqs(true)}
                            onBlur={() => setShowPasswordReqs(false)}
                        />

                        {/* Indicadores de requisitos */}
                        <Collapse in={showPasswordReqs || newPassword.length > 0} animateOpacity>
                            <PasswordRequirementsDisplay requirements={passwordRequirements} />
                        </Collapse>

                        <Button
                            type='submit'
                            w='100%'
                            bg='brand.blue'
                            color='white'
                            size='lg'
                            _hover={{ bg: 'brand.blueLight'}}
                            isLoading={loading}
                        >
                            Restablecer Contraseña
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </Flex>
    );
};

export default ResetPassword;