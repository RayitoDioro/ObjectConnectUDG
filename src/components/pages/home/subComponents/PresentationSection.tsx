import { Box, Heading, Text } from '@chakra-ui/react';
import rectoriaUDG from '@/assets/rectoriaUDG.webp';

const PresentationSection = () => {
    return (
        <>
            <Box
                textAlign={"center"} 
                py={{ base: "16", md: "20" }}
                color={"white"}
                bgImage={`linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${rectoriaUDG})`}
                bgSize={"cover"}
                bgPosition={"center"}
            >
                <Text fontSize={"lg"}>Plataforma Oficial</Text>
                <Heading size={"xl"}>Objetos Perdidos y Encontrados UDG</Heading>
                <Text mt={2}>Encuentra o reporta objetos perdidos en la comunidad universitaria.</Text>
            </Box>
        </>
    );
}

export default PresentationSection;