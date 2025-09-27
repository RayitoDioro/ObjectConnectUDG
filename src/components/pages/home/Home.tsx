import { Box } from "@chakra-ui/react";
import rectoriaUDG from '@/assets/rectoriaUDG.webp';
import { useState, useEffect } from 'react';
import PresentationSection from './subComponents/PresentationSection';
import FilterSortControls from './subComponents/FilterSortControls';
import ObjectGrid from "./subComponents/ObjectGrid";
import { type CardProps } from "@/types";

const objetos: CardProps[] = [
  {
    id: 1,
    status: "lost",
    imageUrl: rectoriaUDG,
    altText: "Mochila Negra",
    title: "Mochila Negra en CUCEI",
    date: "15/May/2024",
    location: "Edificio A",
  },
  {
    id: 2,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 3,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 4,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 5,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 6,
    status: "lost",
    imageUrl: "",
    altText: "Celular",
    title: "Celular en Biblioteca",
    date: "16/May/2024",
    location: "Piso 2",
  },
  {
    id: 7,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 8,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  },
  {
    id: 9,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 10,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  },
  {
    id: 11,
    status: "found",
    imageUrl: "",
    altText: "Llaves",
    title: "Llaves cerca de la Biblioteca",
    date: "15/May/2024",
    location: "Llavero rojo",
  },
  {
    id: 12,
    status: "found",
    imageUrl: "",
    altText: "Lentes",
    title: "Lentes de armazón negro",
    date: "16/May/2024",
    location: "Encontrados en la cafetería",
  }
];

const Home = () => {
  const [filteredObjects, setFilteredObjects] = useState(objetos);
  const [searchObj, setSearchObj] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');  

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // FILTRADO
      let processedObjects;

      if(searchObj === '') {
        processedObjects = objetos;
      } else {
        const lowercasedFilter = searchObj.toLowerCase();
        processedObjects = objetos.filter(obj => 
          obj.title.toLowerCase().includes(lowercasedFilter) ||
          obj.location.toLowerCase().includes(lowercasedFilter)
        );
      }

      // ORDENAMIENTO
      const sortedObjects = [...processedObjects];

      if(sortBy === 'newest') {
        sortedObjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        sortedObjects.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      setFilteredObjects(sortedObjects);      

    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchObj, sortBy]);

  return(
    <Box>
      <PresentationSection/>

      <FilterSortControls
        searchObj={searchObj}
        setSearchObj={setSearchObj}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ObjectGrid
        lostItems={lostItems}
        foundItems={foundItems}
        searchObj={searchObj}
      />
    </Box>
  );
}

export default Home;