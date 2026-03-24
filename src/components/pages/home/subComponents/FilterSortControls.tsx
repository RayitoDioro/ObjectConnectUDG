import { Box, Button, Stack, InputGroup, InputLeftElement, Input, Select, Collapse, useDisclosure, SimpleGrid } from '@chakra-ui/react';
import { SearchIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
import { type FilterControlsProps } from '@/types';
import { type CategoryDB } from '../Home'; 

interface ExtendedFilterProps extends FilterControlsProps {
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categoriesList?: CategoryDB[]; 
}

const FilterSortControls = ({
  searchObj, setSearchObj, 
  sortBy, setSortBy, 
  categoryFilter, setCategoryFilter,
  categoriesList = [] 
}: ExtendedFilterProps) => {
    const { isOpen, onToggle } = useDisclosure();
    
    return(
        <>
            <Box textAlign='center' my='6'>
            <Button 
              color='brand.blueLight' borderColor='brand.blueLight' 
              _hover={{ bg: 'brand.blueLight', color: 'white'}} 
              variant='outline' leftIcon={<ArrowUpDownIcon/>} onClick={onToggle}
            >
                {isOpen ? 'Ocultar' : 'Buscar o Filtrar'}
            </Button>
            </Box>
            
            <Collapse in={isOpen} animateOpacity>
                <Box w={{ base: '95%', md: '900px'}} mx='auto' mb='4' p='4' bg='white' shadow='md' borderRadius="md">
                    <Stack spacing={4}>
                        <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.500" /></InputLeftElement>
                            <Input
                             type="text" borderRadius="md" placeholder="Buscar por título o ubicación..."
                             value={searchObj} onChange={(e) => setSearchObj(e.target.value)}
                            />
                        </InputGroup>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            
                            {/* Filtro por Categorías DINÁMICO */}
                            <Select 
                              value={categoryFilter} 
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              size="md"
                            >
                                <option value="Todas">Todas las categorías</option>
                                {/* Imprimimos las opciones desde la base de datos */}
                                {categoriesList.map((cat) => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                            </Select>

                            <Select 
                              value={sortBy} 
                              onChange={(e) => setSortBy(e.target.value)}
                              size="md"
                            >
                                <option value="newest">Más nuevos primero</option>
                                <option value="oldest">Más antiguos primero</option>
                            </Select>

                        </SimpleGrid>
                    </Stack>
                </Box>
            </Collapse>
        </>
    );
}

export default FilterSortControls;