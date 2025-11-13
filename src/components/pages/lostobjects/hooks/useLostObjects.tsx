import { useState, useEffect } from "react";
import type { FullCardProps } from "@/types";
import { useSchemas } from "../../../../hooks/useSchemas";

export const useLostObjects = () => {
    const { getPosts } = useSchemas();

    const [lostObjects, setLostObjects] = useState<FullCardProps[]>([]);
    const [possibleMatches, setPossibleMatches] = useState<FullCardProps[]>([]);
    const [filteredObjects, setFilteredObjects] = useState<FullCardProps[]>([]);

    useEffect(() => {
        const fetchLostObjects = async () => {
            try {
                const posts = await getPosts(1); // 1 for "LOST"

                if (posts) {
                    const mappedPosts: FullCardProps[] = posts.map((post) => ({
                        id: post.id,
                        status: post.post_state_id === 1 ? 'lost' : 'found',
                        imageUrl: post.photo_url || '', // Default to empty string if null
                        altText: post.title, // Use title as alt text
                        title: post.title,
                        date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
                        location: post.location || 'Sin ubicación',
                        description: post.description || 'Sin descripción',
                        userId: post.user_id,
                    }));
                    setLostObjects(mappedPosts);
                    setFilteredObjects(mappedPosts); // Initially, filtered is all
                }
            } catch (error) {
                console.error("Error fetching lost objects:", error);
                // Handle error appropriately
            }
        };

        fetchLostObjects();
    }, [getPosts]);


    const filterObjectsByTerm = (term: string) => {
        if (!term) {
            setFilteredObjects(lostObjects); // If there is no term, display all objects
            return;
        }

        const lowercasedTerm = term.toLowerCase();
        const filtered = lostObjects.filter(object =>
            object.title.toLowerCase().includes(lowercasedTerm) ||
            (object.location && object.location.toLowerCase().includes(lowercasedTerm))
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
        lostObjects: filteredObjects, // Return filtered objects for display
        possibleMatches,
        getPossibleMatches, 
        filterObjectsByTerm,
    }
}