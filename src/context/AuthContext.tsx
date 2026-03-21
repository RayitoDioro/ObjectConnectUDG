import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabaseClient } from '../supabaseClient';
import { type Session } from '@supabase/supabase-js';
import { type UserProfile } from '../types';
import { ADMIN_ROLE_IDS } from '@/Config/roles';

// Aquí defino el tipo de datos que tendrá el contexto (sesión y perfil de usuario)
type AuthContextType = {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  roleId: number | null;
  isAdmin: boolean;
};

// Creación del contexto que se va a compartir
const AuthContext = createContext<AuthContextType>({ 
  session: null,
  profile: null,
  loading: true,
  roleId: null,
  isAdmin: false });

// Componente proveedor del contexto que contiene la lógica de la autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Maneja y mejora el estado de carga al usuario

  // Obtenemos la sesión inicial al cargar el componente
  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: {session} } = await supabaseClient.auth.getSession();
      setSession(session);

      if(session) {
        const { data } = await supabaseClient
            .from('user_profile')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

            setProfile(data as UserProfile | null);
            const role_id = (data as UserProfile | null)?.role_id ?? null;
            setRoleId(role_id);
            setIsAdmin(role_id != null && ADMIN_ROLE_IDS.includes(role_id))
      }
      setLoading(false);
    };

    fetchInitialSession();

    // Luego, se suscribe a cambios futuros
    const { data: {subscription}} = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Se limpia el 'listener' cuando el componente se desmonta
    return () => subscription.unsubscribe();
  }, []);

  // Este useEffect reacciona a cambios de sesión, se activa cuando el usuario inicia o cierra sesión después de la carga inicial
  useEffect(() => {
    const fetchProfileOnSessionChange = async () => {
      if(session) {
        const { data } = await supabaseClient
          .from('user_profile')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

          setProfile(data as UserProfile | null);
          const role_id = (data as UserProfile | null)?.role_id ?? null;
          setRoleId(role_id);
          setIsAdmin(role_id != null && ADMIN_ROLE_IDS.includes(role_id))
      } else {
        setProfile(null);
        setRoleId(null);
        setIsAdmin(false);
      }
    };

    fetchProfileOnSessionChange();
  }, [session]);

  useEffect(() => {
    console.log('roleId actualizado:', roleId);
    console.log('isAdmin actualizado:', isAdmin);
  }, [roleId, isAdmin]);

  // Datos y funciones que se van a compartir con el contexto
  const value = {
    session,
    profile,
    loading,
    roleId,
    isAdmin
  };

  // El Provider hace que el "value" (la sesión, perfil y loading) estén disponibles para todos sus hijos, 
  // no se renderiza los hijos hasta que sepamos si hay o no una sesión
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Este es un hook personalizado para consumir el contexto fácilmente en los demás componentes
export const useAuth = () => {
  return useContext(AuthContext);
};