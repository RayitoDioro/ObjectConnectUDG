import { Box, Text, Heading, Flex, SimpleGrid } from "@chakra-ui/react";
import Card from '../../../ui/Card';
import { type ObjectGridProps } from "@/types";

const ObjectGrid = ({lostItems, foundItems, searchObj}: ObjectGridProps) => {
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
                        <Card key={obj.id} {...obj} />
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
                        <Card key={obj.id} {...obj} />
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