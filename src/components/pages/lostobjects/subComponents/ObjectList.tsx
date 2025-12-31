import { useState, useMemo } from 'react';
import {
    VStack,
    Heading,
    Flex,
    Text,
    Card,
    Image,
    Stack,
    CardBody,
    InputGroup,
    InputLeftElement,
    Input,
    Select,
    Button,
    Collapse,
    useDisclosure,
    Box,
    Avatar,
    HStack,
    Link,
} from '@chakra-ui/react';
import { SearchIcon, ArrowUpDownIcon } from '@chakra-ui/icons';
import type { FullCardProps } from '../../../../types';
import { Link as RouterLink } from 'react-router-dom';

interface ObjectListProps {
    title: string;
    items: FullCardProps[];
    emptyListMessage: string;
    onCardClick: (object: FullCardProps) => void;
    selectedObjectId: string | number | null;
}

export const ObjectList = ({ title, items, emptyListMessage, onCardClick, selectedObjectId }: ObjectListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const { isOpen, onToggle } = useDisclosure();

    const displayedItems = useMemo(() => {
        const filtered = items.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            const itemA_timestamp = new Date(a.rawDate).getTime();
            const itemB_timestamp = new Date(b.rawDate).getTime();
            return sortBy === 'newest' ? itemB_timestamp - itemA_timestamp : itemA_timestamp - itemB_timestamp;
        });
    }, [items, searchTerm, sortBy]);

    return (
        <>
            <Heading as="h2" size="lg" mb={4} color="brand.blue" textAlign="center">
                {title}
            </Heading>

            {items.length > 0 && (
                <Box textAlign="center" mb={4}>
                    <Button
                        variant="outline"
                        colorScheme="brand"
                        onClick={onToggle}
                        leftIcon={<ArrowUpDownIcon />}
                    >
                        {isOpen ? 'Ocultar' : 'Buscar o filtrar'}
                    </Button>
                </Box>
            )}

            <Collapse in={isOpen} animateOpacity>
                <VStack spacing={4} mb={6} p={4} bg="white" shadow="sm" borderRadius="md">
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.300" />
                        </InputLeftElement>
                        <Input placeholder="Buscar por título o ubicación..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                    </Select>
                </VStack>
            </Collapse>

            {displayedItems.length > 0 ? (
                <VStack spacing={4} align="stretch">
                    {displayedItems.map((item) => (
                        <Card
                            key={item.id}
                            direction={{ base: 'column', sm: 'row' }}
                            overflow='hidden'
                            borderWidth="1px"
                            variant='outline'
                            bg={selectedObjectId === item.id ? 'blue.50' : 'white'}
                            borderColor={selectedObjectId === item.id ? 'brand.blue' : 'gray.200'}
                            w="100%"
                            _hover={{ boxShadow: 'md', borderColor: 'brand.blueLight' }}
                            transition="all 0.2s"
                        >
                            <Image
                                objectFit='contain'
                                maxW={{ base: '100%', sm: '150px' }}
                                src={item.imageUrl}
                                alt={item.altText}
                                bg="gray.100"
                                onClick={() => onCardClick(item)}
                                cursor="pointer"
                            />
                            <Stack flex="1">
                                <CardBody>
                                    <Box onClick={() => onCardClick(item)} cursor="pointer">
                                        <Heading size='md' color="brand.blue">{item.title}</Heading>
                                        <Text py='2' fontSize="sm" noOfLines={1}>
                                            Descripción: {item.description.length > 40 ? `${item.description.substring(0, 40)}...` : item.description}
                                        </Text>
                                        <Text fontSize="sm">Ubicación: {item.location}</Text>
                                        <Text color="gray.500" fontSize="xs" pt='2'>Fecha: {item.date}</Text>
                                    </Box>
                                    <Link as={RouterLink} to={`/perfil/${item.userId}`} mt={3} _hover={{ textDecoration: 'none' }}>
                                        <HStack mt={2} align="center">
                                            <Avatar size="sm" name={item.authorName} src={item.authorAvatarUrl || ''} />
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium" noOfLines={1}>
                                                {item.authorName}
                                            </Text>
                                        </HStack>
                                    </Link>
                                </CardBody>
                            </Stack>
                        </Card>
                    ))}
                </VStack>
            ) : (
                <Flex align="center" justify="center" h="50%">
                    <Text color="gray.500" textAlign="center">{emptyListMessage}</Text>
                </Flex>
            )}
        </>
    );
};