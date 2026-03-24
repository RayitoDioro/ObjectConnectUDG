import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/supabaseClient';
import { type RolePermissions } from '@/types';

export const usePermissions = () => {
  const { profile } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!profile?.user_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Obtener el rol del usuario
        const { data: userData, error: userError } = await supabaseClient
          .from('user_profile')
          .select('role_id, Roles(id, role_name)')
          .eq('user_id', profile.user_id)
          .single();

        if (userError) throw userError;

        const roleId = userData?.role_id;
        const roleName = (userData?.Roles as unknown as { role_name: string })?.role_name;

        // 2. Obtener permisos del rol
        const { data: permissionsData, error: permError } = await supabaseClient
          .from('roles_permisos')
          .select(`
            id,
            rol_id,
            permiso_id,
            roles_permisos_permiso_id_fkey(id, permiso, descripcion)
          `)
          .eq('rol_id', roleId);

        if (permError) throw permError;

        // 3. Transformar datos
        const permissions = (permissionsData || []).map(
          (rp: unknown) => (rp as { roles_permisos_permiso_id_fkey: { permiso: string } }).roles_permisos_permiso_id_fkey.permiso
        );

        setRolePermissions({
          roleId,
          roleName,
          permissions, // Array de strings: ['create_posts', 'delete_users', ...]
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setRolePermissions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [profile?.user_id]);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permiso: string): boolean => {
    return rolePermissions?.permissions.includes(permiso) || false;
  };

  // Verificar si el usuario tiene TODOS los permisos especificados
  const hasAllPermissions = (permisos: string[]): boolean => {
    return permisos.every(p => hasPermission(p));
  };

  // Verificar si el usuario tiene AL MENOS UNO de los permisos
  const hasAnyPermission = (permisos: string[]): boolean => {
    return permisos.some(p => hasPermission(p));
  };

  return {
    rolePermissions,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};