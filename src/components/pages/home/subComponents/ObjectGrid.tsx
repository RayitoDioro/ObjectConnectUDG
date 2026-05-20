import { Box, Text, Heading, Flex, SimpleGrid, Button } from "@chakra-ui/react";
import Card from '../../../ui/Card';
import { type ObjectGridProps, type CardProps } from "@/types";
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForwardIcon } from "@chakra-ui/icons";

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
                {/* Ver más o mensaje de todos mostrados */}
                {lostItems.length > 0 && lostItems.length < 16 && (
                <Box textAlign="center" mt="auto" pt={4}>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        Estos son todos los objetos perdidos disponibles
                    </Text>
                </Box>
                )}
                {lostItems.length === 16 && (
                    <Box textAlign="center" mt="auto" pt={4}>
                        <Button
                        as={RouterLink}
                        to="/objetos-perdidos"
                        colorScheme="blue"
                        variant="outline"
                        size="md"
                        border={"2px"}
                        rounded={"10px"}
                        textDecoration="none"
                        rightIcon={<ArrowForwardIcon />}
                        _hover={{ textDecoration: 'none', bg: 'blue.600', color: 'white' }}
                        >
                        Ver más objetos perdidos
                        </Button>
                    </Box>
                )}
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
                {/* Ver más o mensaje de todos mostrados */}
                {foundItems.length > 0 && foundItems.length < 16 && (
                <Box textAlign="center" mt="auto" pt={4}>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        Estos son todos los objetos encontrados disponibles
                    </Text>
                </Box>
                )}
                {foundItems.length === 16 && (
                    <Box textAlign="center" mt="auto" pt={4}>
                        <Button
                        as={RouterLink}
                        to="/objetos-encontrados"
                        colorScheme="green"
                        variant="outline"
                        size="md"
                        border={"2px"}
                        rounded={"10px"}
                        textDecoration="none"
                        rightIcon={<ArrowForwardIcon />}
                        _hover={{ textDecoration: 'none', bg: 'green.600', color: 'white' }}
                        >
                        Ver más objetos encontrados
                        </Button>
                    </Box>
                )}
                </Box>
            </Flex>
        </>
    );
}

export default ObjectGrid;