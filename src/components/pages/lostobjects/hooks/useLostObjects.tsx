import { useState, useEffect } from "react";
import type { FullCardProps, Post, UserProfile } from "@/types";
import { useSchemas } from "../../../../hooks/useSchemas";
import { supabaseClient } from "@/supabaseClient";

export const useLostObjects = () => {
    const { getPosts } = useSchemas();

    const [lostObjects, setLostObjects] = useState<FullCardProps[]>([]);
    const [possibleMatches, setPossibleMatches] = useState<FullCardProps[]>([]);
    const [filteredObjects, setFilteredObjects] = useState<FullCardProps[]>([]);

    useEffect(() => {
        const fetchLostObjects = async () => {
            try {
                const posts: Post[] = await getPosts(1); // 1 for "LOST"

                if (posts) {
                    // Get unique user IDs from posts, filtering out any null/undefined values
                    const userIds = [...new Set(posts.map(post => post.user_id).filter(Boolean))];
                    
                    let profiles: UserProfile[] = [];
                    // Only call the RPC function if there are user IDs to fetch
                    if (userIds.length > 0) {
                        const { data, error: profileError } = await supabaseClient
                            .rpc('get_public_user_profiles', { user_ids: userIds });

                        if (profileError) throw profileError;
                        if (data) {
                            profiles = data;
                        }
                    }

                    // Create a map for easy lookup
                    const profileMap = new Map<string, UserProfile>();
                    profiles.forEach((p: UserProfile) => profileMap.set(p.user_id, p));

                    const mappedPosts: FullCardProps[] = posts.map((post) => {
                        const userProfile = profileMap.get(post.user_id);
                        return {
                            id: post.id,
                            status: post.post_state_id === 1 ? 'lost' : 'found',
                            imageUrl: post.photo_url || '',
                            altText: post.title,
                            title: post.title,
                            date: new Date(post.date_was_found || post.created_at).toLocaleDateString(),
                            rawDate: post.date_was_found || post.created_at,
                            location: post.location || 'Sin ubicación',
                            description: post.description || 'Sin descripción',
                            userId: post.user_id,
                            authorName: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuario Anónimo',
                            authorAvatarUrl: userProfile?.photo_profile_url || null,
                        };
                    });
                    setLostObjects(mappedPosts);
                    setFilteredObjects(mappedPosts);
                }
            } catch (error) {
                console.error("Error fetching lost objects:", error);
            }
        };

        fetchLostObjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


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