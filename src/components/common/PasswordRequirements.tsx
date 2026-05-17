import { Box, Text, List, ListItem, ListIcon } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { type PasswordRequirements as Requirements } from '@/utils/passwordValidation';

interface PasswordRequirementsProps {
    requirements: Requirements;
}

export const PasswordRequirementsDisplay = ({ requirements }: PasswordRequirementsProps) => {
    return (
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
                <ListItem color={requirements.minLength ? 'green.600' : 'gray.500'}>
                    <ListIcon 
                        as={requirements.minLength ? CheckCircleIcon : WarningIcon} 
                        color={requirements.minLength ? 'green.500' : 'gray.400'}
                    />
                    Mínimo 6 caracteres
                </ListItem>
                <ListItem color={requirements.hasLowercase ? 'green.600' : 'gray.500'}>
                    <ListIcon 
                        as={requirements.hasLowercase ? CheckCircleIcon : WarningIcon} 
                        color={requirements.hasLowercase ? 'green.500' : 'gray.400'}
                    />
                    Al menos una letra minúscula (a-z)
                </ListItem>
                <ListItem color={requirements.hasUppercase ? 'green.600' : 'gray.500'}>
                    <ListIcon 
                        as={requirements.hasUppercase ? CheckCircleIcon : WarningIcon} 
                        color={requirements.hasUppercase ? 'green.500' : 'gray.400'}
                    />
                    Al menos una letra MAYÚSCULA (A-Z)
                </ListItem>
                <ListItem color={requirements.hasNumber ? 'green.600' : 'gray.500'}>
                    <ListIcon 
                        as={requirements.hasNumber ? CheckCircleIcon : WarningIcon} 
                        color={requirements.hasNumber ? 'green.500' : 'gray.400'}
                    />
                    Al menos un número (0-9)
                </ListItem>
                <ListItem color={requirements.hasSpecial ? 'green.600' : 'gray.500'}>
                    <ListIcon 
                        as={requirements.hasSpecial ? CheckCircleIcon : WarningIcon} 
                        color={requirements.hasSpecial ? 'green.500' : 'gray.400'}
                    />
                    Al menos un carácter especial (!@#$%^&*)
                </ListItem>
            </List>
        </Box>
    );
};