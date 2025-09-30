import type { CardProps } from '@/types';
import { useState, useEffect } from 'react';

export const useObjectFilter = (objects: CardProps[]) => {
    const [filteredObjects, setFilteredObjects] = useState(objects);
    const [searchObj, setSearchObj] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // FILTRADO
      let processedObjects;

      if(searchObj === '') {
        processedObjects = objects;
      } else {
        const lowercasedFilter = searchObj.toLowerCase();
        processedObjects = objects.filter(obj => 
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
  }, [searchObj, sortBy, objects]);

  return { searchObj, setSearchObj, sortBy, setSortBy, filteredObjects}
} 