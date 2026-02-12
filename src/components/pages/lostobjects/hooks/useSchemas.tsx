import { supabaseClient } from "@/supabaseClient";

type ExistingThreadInfo = {
    thread_id: number;
    other_participant_id: string;
};

export const useSchemas = () => {

    /**
     * Crea un nuevo hilo de chat e inserta el primer mensaje.
     * Retorna el ID del hilo creado.
     */
    async function createThreaForPost(finderId: string, postId: number, objectOwnerId: string): Promise<number | null> {
        try {
            // 1. Verificar si ya existe un hilo con este usuario
            const { data: existingThreads, error: fetchError } = await supabaseClient.rpc('get_user_threads');
            
            if (fetchError) {
                console.error("Error fetching existing threads:", fetchError);
                // Si falla la verificación, continuamos para no bloquear
            } else if (existingThreads) {
                const existingThread = (existingThreads as ExistingThreadInfo[]).find(
                    t => t.other_participant_id === finderId
                );
                
                if (existingThread) {
                    console.log("Thread already exists, redirecting to thread:", existingThread.thread_id);
                    return existingThread.thread_id;
                }
            }

            // 2. Si no existe, crear uno nuevo
            // El mensaje inicial definido por el usuario
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