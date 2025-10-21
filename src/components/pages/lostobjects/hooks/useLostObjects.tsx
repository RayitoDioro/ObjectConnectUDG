import { useState } from "react"// Renamed for clarity
import type { FullCardProps } from "@/types"
import { useSchemas } from "./useSchemas"

export const useLostObjects = () => {

    const { posts } = useSchemas()

    const [lostObjects, setLostObjects] = useState<FullCardProps[]>(posts)
    const [possibleMatches, setPossibleMatches] = useState<FullCardProps[]>([])
    const [filteredObjects, setFilteredObjects] = useState<FullCardProps[]>([])

    const filterObjectsByTerm = (term: string) => {
        if (!term) {
            setLostObjects(lostObjects); // If there is no term, display all objects
            return;
        }

        const lowercasedTerm = term.toLowerCase();
        const filtered = lostObjects.filter(object =>
            object.title.toLowerCase().includes(lowercasedTerm) ||
            object.location.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredObjects(filtered);
    };
    
    const getPossibleMatches = (title: string, features: string) => {
        // 1. We prepare the target words (user search).
        const targetWords = new Set(
            `${title} ${features}`
                .toLowerCase()
                .replace(/,/g, '') // Elimina comas
                .split(' ')
                .filter(word => word.length > 2) // We ignore very short words
        );

        if (targetWords.size === 0) {
            setPossibleMatches([]);
            return;
        }

        // 2. We filter the objects to find matches.
        const matches = lostObjects.filter(object => {
            const objectWords = new Set(
                `${object.title} ${object.description}`.toLowerCase().replace(/,/g, '').split(' ')
            );

            const intersection = new Set([...targetWords].filter(word => objectWords.has(word)));
            const matchPercentage = (intersection.size / targetWords.size) * 100;

            return matchPercentage >= 30;
        });

        setPossibleMatches(matches);
    };

    return {
        lostObjects,
        possibleMatches,
        getPossibleMatches, 
        filterObjectsByTerm,
        filteredObjects
    }
}