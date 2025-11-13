import { supabaseClient } from '../supabaseClient';

export type PostPayload = {
    title: string;
    description: string;
    foundWhere?: string;
    deliveredWhere?: string;
    dateFound?: string | null;
    email?: string;
    category?: string;
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
        try {
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

                publicUrl = (urlData as any)?.publicUrl ?? null;
            }

            const insertPayload = {
                title: payload.title,
                description: payload.description,
                location: payload.foundWhere ?? payload.deliveredWhere ?? null,
                photo_url: publicUrl,
                user_id: userId,
                post_state_id: 1,
                date_was_found: payload.dateFound ?? null,
            };

            const { data: inserted, error: insertError } = await supabaseClient
                .from('posts')
                .insert(insertPayload)
                .select()
                .single();

            if (insertError) throw insertError;

            return inserted;
        } catch (err) {
            // re-lanzar para que el componente lo maneje
            throw err;
        }
    }

    async function getPosts(postStateId?: number) {
        try {
            let query = supabaseClient.from('posts').select('*');

            if (postStateId) {
                query = query.eq('post_state_id', postStateId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data;
        } catch (err) {
            // re-lanzar para que el componente lo maneje
            throw err;
        }
    }

    /**
     * Obtiene el perfil público de un usuario desde la tabla 'user_profile'.
     * No puede obtener datos de 'auth.users' directamente por seguridad.
     */
    async function getUserById(userId: string) {
        try {
            // Por razones de seguridad, no se puede acceder a la tabla 'auth.users'
            // de Supabase desde el cliente para obtener el email de otros usuarios.
            // Esta función solo obtiene el perfil público desde 'user_profile'.
            const { data, error } = await supabaseClient
                .from('user_profile')
                .select('first_name, last_name, photo_profile_url, creation_date')
                .eq('user_id', userId)
                .single();

            // Si hay un error y no es porque el usuario no existe, lo lanzamos.
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user profile:', error);
                throw error;
            }

            return data;
        } catch (err) {
            console.error('An unexpected error occurred in getUserById:', err);
            // Re-lanzar el error para que el código que llama a la función pueda manejarlo
            throw err;
        }
    }

    return { uploadPostWithImage, getPosts, getUserById };
}