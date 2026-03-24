import { useState, useEffect } from 'react';

export const useObjectFilter = (objects: any[]) => { // Usamos any[] temporalmente para aceptar nuestras nuevas propiedades
  const [filteredObjects, setFilteredObjects] = useState(objects);
  const [searchObj, setSearchObj] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // NUEVO: Estado para la categoría
  const [categoryFilter, setCategoryFilter] = useState(''); 

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      
      // 1. INICIAMOS CON TODOS LOS OBJETOS
      let processedObjects = objects;

      // 2. FILTRO POR TEXTO (Buscador)
      if (searchObj !== '') {
        const lowercasedFilter = searchObj.toLowerCase();
        processedObjects = processedObjects.filter(obj => 
          obj.title.toLowerCase().includes(lowercasedFilter) ||
          obj.location.toLowerCase().includes(lowercasedFilter)
        );
      }

      // 3. FILTRO POR CATEGORÍA
      if (categoryFilter !== '' && categoryFilter !== 'Todas') {
        processedObjects = processedObjects.filter(obj => 
          obj.category === categoryFilter
        );
      }

      // 4. ORDENAMIENTO (Corregido)
      const sortedObjects = [...processedObjects];

      sortedObjects.sort((a, b) => {
        // Usamos rawDate (fecha en formato máquina) si existe, si no, intentamos con la normal
        const dateA = new Date(a.rawDate || a.date).getTime();
        const dateB = new Date(b.rawDate || b.date).getTime();

        if (sortBy === 'newest') {
          return dateB - dateA; // Más recientes primero
        } else {
          return dateA - dateB; // Más antiguos primero
        }
      });

      setFilteredObjects(sortedObjects);      

    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchObj, sortBy, categoryFilter, objects]); // Agregamos categoryFilter aquí

  return { 
    searchObj, setSearchObj, 
    sortBy, setSortBy, 
    categoryFilter, setCategoryFilter, // Exportamos los controles de categoría
    filteredObjects
  };
}