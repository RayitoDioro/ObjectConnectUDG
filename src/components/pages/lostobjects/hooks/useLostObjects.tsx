import { useState, useEffect, useCallback } from "react";
import type { FullCardProps, Post, UserProfile } from "@/types";
import { useSchemas } from "../../../../hooks/useSchemas";
import { supabaseClient } from "@/supabaseClient";

const SEARCH_API_URL = "/api-proxy/buscar";
const SIMILARITY_THRESHOLD = 0.3;
const SEARCH_TIMEOUT_MS = 90000; // 90 seconds timeout for Render cold start

export const useLostObjects = () => {
    const { getPosts } = useSchemas();

    const [lostObjects, setLostObjects] = useState<FullCardProps[]>([]);
    const [possibleMatches, setPossibleMatches] = useState<FullCardProps[]>([]);
    const [filteredObjects, setFilteredObjects] = useState<FullCardProps[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);

    useEffect(() => {
        const fetchLostObjects = async () => {
            try {
                const posts: Post[] = await getPosts(1); // 1 for "LOST"

                if (posts) {
                    const userIds = [...new Set(posts.map(post => post.user_id).filter(Boolean))];
                    
                    let profiles: UserProfile[] = [];
                    if (userIds.length > 0) {
                        const { data, error: profileError } = await supabaseClient
                            .rpc('get_public_user_profiles', { user_ids: userIds });

                        if (profileError) throw profileError;
                        if (data) {
                            profiles = data;
                        }
                    }

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
                            categoryId: post.product_category_id || 0,
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
            setFilteredObjects(lostObjects);
            return;
        }

        const lowercasedTerm = term.toLowerCase();
        const filtered = lostObjects.filter(object =>
            object.title.toLowerCase().includes(lowercasedTerm) ||
            (object.location && object.location.toLowerCase().includes(lowercasedTerm))
        );
        setFilteredObjects(filtered);
    };

    const performSearch = useCallback(async (title: string, features: string, objectsToFilter: FullCardProps[]) => {
         if (!title && !features) {
            setPossibleMatches([]);
            return;
        }
        
        setIsLoadingMatches(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

        try {
            console.log(`Searching for: ${title}, ${features}`);
            const response = await fetch(SEARCH_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // 'Accept': 'application/json' 
                },
                body: JSON.stringify({ 
                    title, 
                    description: features, 
                    similarity_threshold: SIMILARITY_THRESHOLD 
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Search API failed: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Search results:", data);
            
            const matchesData = data.matches || [];
            const matchIds = matchesData.map((m: any) => m.id);

            // Filter and Sort
            // Note: If objectsToFilter is empty (e.g. not loaded yet), this returns empty.
            // But usually this is called when user interacts, so objects should be loaded.
            const matches = objectsToFilter.filter(obj => matchIds.includes(obj.id));
            
            const sortedMatches = matches.sort((a, b) => {
                const indexA = matchIds.indexOf(a.id);
                const indexB = matchIds.indexOf(b.id);
                return indexA - indexB;
            });
            
            setPossibleMatches(sortedMatches);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error("Search request timed out");
            } else {
                console.error("Search error:", error);
            }
            setPossibleMatches([]);
        } finally {
            console.log("Search finished, setting loading to false");
            setIsLoadingMatches(false);
            clearTimeout(timeoutId); // Ensure cleanup
        }
    }, []);

    const getPossibleMatches = async (title: string, features: string) => {
        sessionStorage.setItem('searchTitle', title);
        sessionStorage.setItem('searchDescription', features);
        await performSearch(title, features, lostObjects);
    };

    const clearSearch = () => {
        sessionStorage.removeItem('searchTitle');
        sessionStorage.removeItem('searchDescription');
        setPossibleMatches([]);
    };

    // Auto-search on load (once lostObjects is ready)
    useEffect(() => {
        if (lostObjects.length > 0) {
            const title = sessionStorage.getItem('searchTitle');
            const features = sessionStorage.getItem('searchDescription');
            
            if (title || features) {
                // If we already have matches and they match the criteria, we might skip?
                // But safer to re-run to ensure consistency.
                performSearch(title || '', features || '', lostObjects);
            }
        }
    }, [lostObjects, performSearch]);

    return {
        lostObjects: filteredObjects,
        possibleMatches,
        getPossibleMatches, 
        filterObjectsByTerm,
        clearSearch,
        isLoadingMatches
    }
}