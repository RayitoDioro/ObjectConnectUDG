import { Box, Button, Stack, InputGroup, InputLeftElement, Input, Select, Collapse, useDisclosure } from '@chakra-ui/react';
import { SearchIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
import { type FilterControlsProps } from '@/types';

const FilterSortControls = ({searchObj, setSearchObj, sortBy, setSortBy}: FilterControlsProps) => {
    const { isOpen, onToggle } = useDisclosure();
    
    return(
        <>
            <Box textAlign='center' my='6'>
            <Button 
              color='brand.blueLight' 
              borderColor='brand.blueLight' 
              _hover={{ bg: 'brand.blueLight', color: 'white'}} 
              variant='outline' 
              leftIcon={<ArrowUpDownIcon/>} 
              onClick={onToggle}
            >
                {isOpen ? 'Ocultar' : 'Buscar o Filtrar'}
            </Button>
            </Box>
            {/* Panel que contiene la barra de búsqueda y filtros */}
            <Collapse in={isOpen} animateOpacity>
                <Box
                  w={{ base: '95%', md: '900px'}}
                  mx='auto'
                  mb='4'
                  p='4'
                  bg='white'
                  shadow='md'
                >
                    <Stack spacing={4}>
                        <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.500" />
                            </InputLeftElement>
                            <Input
                             type="text"
                             borderRadius="md"
                             placeholder="Buscar por título o ubicación..."
                             value={searchObj}
                             onChange={(e) => setSearchObj(e.target.value)}
                            />
                        </InputGroup>
                            <Select 
                              value={sortBy} 
                              onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Más nuevos primero</option>
                                <option value="oldest">Más antiguos primero</option>
                            </Select>
                    </Stack>
                </Box>
            </Collapse>
        </>
    );
}

export default FilterSortControls;