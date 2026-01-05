import { useState } from "react";
import type { PostProps, ThreadProps } from "../data/types";
import { supabaseClient } from "@/supabaseClient"; // Importa supabaseClient

// Estos son datos de ejemplo, que ya no usaremos para crear hilos reales,
// pero mantenemos la estructura por si se usan en otras partes aún.
export const sampleThreads: ThreadProps[] = [
    {
        finderId:"adsdasdasd564asd",
        id:"51ebf4bc-1e44-4beb-8446-63bd32c36f69",
        objectOwnerId:"1e6b4623-4896-42bf-92dd-9ca5b789f474",
        postId:1
    }
];

export const sampleMessages = [
    {
        id: "sfsdfsdfsdfsdfsdfsdfsdfs",
        threadId: "51ebf4bc-1e44-4beb-8446-63bd32c36f69",
        senderId: "1e6b4623-4896-42bf-92dd-9ca5b789f474",
        content: "Hola, ¿has visto mi objeto perdido?",
    },
    {
        id: "sfsdfsdfsdfsdfsdfsdfsdfr",
        threadId: "51ebf4bc-1e44-4beb-8446-63bd32c36f69",
        senderId: "adsdasdasd564asd",
        content: "No, crack. Salu2",
    }
];

export const useSchemas = () => {
    // Mantendremos estos estados por ahora, pero la lógica de chat real ya no dependerá de ellos.
    const [posts, setPosts] = useState<PostProps[]>([]); // Asumiendo que 'posts' se cargan de otro lado
    const [threads, setThreads] = useState<ThreadProps[]>(sampleThreads); // Se mantendrá para compatibilidad si hay más referencias

    /**
     * Crea un nuevo hilo de chat e inserta el primer mensaje.
     * Retorna el ID del hilo creado.
     */
    async function createThreaForPost(finderId: string, postId: number, objectOwnerId: string): Promise<number | null> {
        try {
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

            // Opcional: Si quieres mantener el estado local sincronizado, aunque el real ya está en DB
            // setThreads(prev => [...prev, { id: threadId, postId, objectOwnerId, finderId }]);
            
            return threadId;

        } catch (err) {
            console.error("Fallo al crear el hilo:", err);
            return null;
        }
    }

    return {
        posts, // Mantenido para compatibilidad
        threads, // Mantenido para compatibilidad
        createThreaForPost,
        sampleMessages // Mantenido para compatibilidad
    };
};