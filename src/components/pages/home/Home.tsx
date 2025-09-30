import { Box } from "@chakra-ui/react";
import rectoriaUDG from '@/assets/rectoriaUDG.webp';
import PresentationSection from './subComponents/PresentationSection';
import FilterSortControls from './subComponents/FilterSortControls';
import ObjectGrid from "./subComponents/ObjectGrid";
import { type CardProps } from "@/types";
import { useObjectFilter } from "./hooks/useObjectFilter";

const objects: CardProps[] = [
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
  const {
    searchObj,
    setSearchObj,
    sortBy,
    setSortBy,
    filteredObjects
  } = useObjectFilter(objects); // Custom Hook para lógica de filtrado y ordenamiento
  
  const lostItems = filteredObjects.filter(obj => obj.status === 'lost');
  const foundItems = filteredObjects.filter(obj => obj.status === 'found');

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