import { useState } from 'react';
import { Box, Flex, Heading, Input, Button, VStack, useToast, Collapse, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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

    const passwordRequirements = validatePassword(newPassword);

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