import { supabaseClient } from '../supabaseClient';

export type PostPayload = {
    title: string;
    description: string;
    foundWhere?: string;
    dateFound?: string | null;
    product_category_id?: number;
};

export type Category = {
    id: number;
    name: string;
};

/**
 * Custom hook que expone funciones para los schemas (posts, uploads, etc.)
 */
export function useSchemas() {
    /**
     * Sube la imagen (si existe) al bucket 'post_images' en la carpeta del usuario (userId),
     * obtiene la URL pública y luego inserta el registro en la tabla 'posts'.
     * Retorna el registro insertado.
     */
    async function uploadPostWithImage(
        userId: string,
        payload: PostPayload,
        file?: File
    ) {
            let publicUrl: string | null = null;

            if (file) {
                // generar nombre único con extensión
                const ext = file.name.split('.').pop() ?? 'jpg';
                const fileName = `${crypto.randomUUID()}.${ext}`;
                const path = `${userId}/${fileName}`;

                // subir al bucket
                const { error: uploadError } = await supabaseClient.storage
                    .from('post_images')
                    .upload(path, file);

                if (uploadError) throw uploadError;

                // obtener URL pública
                const { data: urlData } = supabaseClient.storage
                    .from('post_images')
                    .getPublicUrl(path);

                publicUrl = (urlData as { publicUrl: string })?.publicUrl ?? null;
            }

            const insertPayload = {
                title: payload.title,
                description: payload.description,
                location: payload.foundWhere ?? null,
                photo_url: publicUrl,
                user_id: userId,
                post_state_id: 1,
                date_was_found: payload.dateFound ?? null,
                product_category_id: payload.product_category_id ?? null,
            };

            const { data: inserted, error: insertError } = await supabaseClient
                .from('posts')
                .insert(insertPayload)
                .select()
                .single();

            if (insertError) throw insertError;

            return inserted;
    }

    async function getPosts(postStateId?: number) {
        let query = supabaseClient.from('posts').select('*');
        if (postStateId) query = query.eq('post_state_id', postStateId);

        const { data, error } = await query;
        if (error) throw error;

        return data;
    }

    async function getCategories(): Promise<Category[]> {
        const { data, error } = await supabaseClient.from('categories').select('id, name');
        if (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
        return (data ?? []) as Category[];
    }

    /**
     * Obtiene el perfil público de un usuario desde la tabla 'user_profile'.
     * No puede obtener datos de 'auth.users' directamente por seguridad.
     */
    async function getUserById(userId: string) {
        try {
            const { data, error } = await supabaseClient
                .rpc('get_public_user_by_id', { p_user_id: userId })
                .single();

            if (error) {
                console.error('Error fetching user profile via RPC:', error);
                throw error;
            }

            return data;
        } catch (err) {
            console.error('An unexpected error occurred in getUserById:', err);
            throw err;
        }
    }

    // --- NUEVA FUNCIÓN AÑADIDA: CREAR HILO DE CHAT VINCULADO A UN POST ---
    async function createThreadForPost(authorId: string, postId: number, currentUserId: string) {
        try {
            // 1. Primero verificamos si ya existe un chat entre estos dos usuarios PARA ESTE POST específico
            // Así evitamos que si le das clic 3 veces al botón de crear chat, se hagan 3 chats idénticos
            const { data: existingThreads, error: fetchError } = await supabaseClient
                .from('threads')
                .select('id')
                .eq('post_id', postId)
                .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`);

            if (fetchError) throw fetchError;

            // Si ya existe, simplemente devolvemos el ID de ese chat para que el navegador te redirija ahí
            if (existingThreads && existingThreads.length > 0) {
                return existingThreads[0].id;
            }

            // 2. Si no existe, creamos el hilo nuevo guardando el post_id
            const { data: newThread, error: insertError } = await supabaseClient
                .from('threads')
                .insert({
                    post_id: postId,
                    participant1_id: currentUserId,
                    participant2_id: authorId
                })
                .select('id')
                .single();

            if (insertError) throw insertError;

            return newThread.id;
        } catch (error) {
            console.error('Error creating thread:', error);
            return null;
        }
    }
    return { uploadPostWithImage, getPosts, getCategories, getUserById, createThreadForPost };
}