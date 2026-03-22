import { supabaseClient } from "@/supabaseClient";

type ExistingThreadInfo = {
    thread_id: number;
    other_participant_id: string;
};

export const useSchemas = () => {

    async function createThreaForPost(finderId: string, postId: number, objectOwnerId: string): Promise<number | null> {
        try {
            // 1. Obtener todos los chats del usuario actual usando tu función RPC original
            const { data: existingThreads, error: fetchError } = await supabaseClient.rpc('get_user_threads');
            
            if (fetchError) {
                console.error("Error fetching existing threads:", fetchError);
            } else if (existingThreads) {
                // 2. Filtramos los chats que tienes ESPECÍFICAMENTE con esta persona (finderId)
                const threadsWithThisUser = (existingThreads as ExistingThreadInfo[]).filter(
                    t => t.other_participant_id === finderId
                );
                
                if (threadsWithThisUser.length > 0) {
                    // 3. Extraemos los IDs de esos chats para buscar cuál es el del post correcto
                    const threadIds = threadsWithThisUser.map(t => t.thread_id);

                    // 4. Le preguntamos a la tabla 'threads' si alguno de esos chats es sobre ESTA publicación (postId)
                    const { data: matchingThreads, error: matchError } = await supabaseClient
                        .from('threads')
                        .select('id')
                        .eq('post_id', postId)
                        .in('id', threadIds);

                    if (!matchError && matchingThreads && matchingThreads.length > 0) {
                        // ¡Bingo! Ya existe un chat exacto para esta persona y este objeto
                        console.log("Thread already exists for this post, redirecting:", matchingThreads[0].id);
                        return matchingThreads[0].id;
                    }
                }
            }

            // 5. Si no existe, crear uno nuevo
            const initialMessageContent = "Hola! Creo que encontraste un objeto mio que se me perdio";

            const { data: threadId, error } = await supabaseClient.rpc('create_thread_with_initial_message', {
                p_post_id: postId,
                p_other_user_id: finderId, // 'finderId' es el otro usuario en el chat
                p_initial_message: initialMessageContent
            });

            if (error) {
                console.error("Error creating thread with initial message:", error);
                throw error;
            }
            
            return threadId;

        } catch (err) {
            console.error("Fallo al crear el hilo:", err);
            return null;
        }
    }

    return {
        createThreaForPost
    };
};