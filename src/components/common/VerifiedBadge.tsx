import { HStack, Text, Icon, Tooltip, VStack } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

interface VerifiedBadgeProps {
  isVerified: boolean;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge = ({ isVerified, email = 'alumnos.udg.mx', size = 'md' }: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const sizeConfig = {
    sm: { icon: 4, text: 'xs', gap: 0.5 },
    md: { icon: 4, text: 'md', gap: 1 },
    lg: { icon: 8, text: 'sm', gap: 1.5 },
  };

  const config = sizeConfig[size];

  return (
    <Tooltip 
      label={`Dominio Verificado: ${email || 'Universidad de Guadalajara'}`}
      placement="top"
      hasArrow
      fontSize="xs"
    >
    <VStack spacing={0} flexShrink={0} align="center">
        <HStack spacing={config.gap} flexShrink={0}>
            <Icon 
            as={CheckCircleIcon} 
            boxSize={config.icon} 
            color="brand.blue"
            />
            {size !== 'sm' && (
            <Text 
                fontSize={config.text} 
                fontWeight="bold" 
                color="brand.blue"
                whiteSpace="nowrap"
            >
                Verificado UDG
            </Text>
            )}
        </HStack>
    </VStack>
    </Tooltip>
  );
};