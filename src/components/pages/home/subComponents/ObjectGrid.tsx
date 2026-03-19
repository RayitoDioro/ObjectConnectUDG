import { Box, Text, Heading, Flex, SimpleGrid } from "@chakra-ui/react";
import Card from '../../../ui/Card';
import { type ObjectGridProps, type CardProps } from "@/types";

interface CustomGridProps extends ObjectGridProps {
  onCardClick: (obj: CardProps) => void;
}

const ObjectGrid = ({lostItems, foundItems, searchObj, onCardClick}: CustomGridProps) => {
    return(
        <>
            {/* Objetos */}
            <Flex justify="space-around" p={10} wrap="wrap" gap={8}>
                {/* Perdidos */}      
                <Box flex="1" minW="300px">
                <Heading textAlign={"center"} size="lg" mb={4} color={"brand.blueLight"}>
                    OBJETOS PERDIDOS
                </Heading>
                { //Mensajes según objetos perdidos existentes/coincidentes
                    lostItems.length === 0 ? (
                    searchObj ? (
                        <Text textAlign="center" mt="4" color="gray.500">
                        No hay objetos perdidos que coincidan con tu búsqueda.
                        </Text>
                    ) : (
                        <Text textAlign="center" mt="4" color="gray.500">
                        Actualmente no hay objetos perdidos para mostrar.
                        </Text>
                    )
                    ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {lostItems.map((obj) => (
                        // Envolvemos la Card en un Box clickeable con efecto hover
                        <Box 
                            key={obj.id} 
                            onClick={() => onCardClick(obj)}
                            cursor="pointer"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.03)', zIndex: 1 }}
                        >
                            <Card {...obj} />
                        </Box>
                        ))}
                    </SimpleGrid>
                    )
                }
                </Box>

                {/* Encontrados */}
                <Box flex={1} minW={"300px"}>
                <Heading textAlign={"center"} size={"lg"} mb={4} color={"#00569c"}>
                    OBJETOS ENCONTRADOS
                </Heading>
                { //Mensajes según objetos encontrados existentes/coincidentes
                    foundItems.length === 0 ? (
                    searchObj ? (
                        <Text textAlign="center" mt="4" color="gray.500">
                        No hay objetos encontrados que coincidan con tu búsqueda.
                        </Text>
                    ) : (
                        <Text textAlign="center" mt="4" color="gray.500">
                        Actualmente no hay objetos encontrados para mostrar.
                        </Text>
                    )
                    ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {foundItems.map((obj) => (
                        // 2. Envolvemos la Card en un Box clickeable con efecto hover
                        <Box 
                            key={obj.id} 
                            onClick={() => onCardClick(obj)}
                            cursor="pointer"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.03)', zIndex: 1 }}
                        >
                            <Card {...obj} />
                        </Box>
                        ))}
                    </SimpleGrid>
                    )
                }
                </Box>
            </Flex>
        </>
    );
}

export default ObjectGrid;