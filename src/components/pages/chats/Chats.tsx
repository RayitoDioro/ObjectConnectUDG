import { useState, useEffect, useRef } from 'react';
import { Box, Flex, VStack, Text, Input, Avatar, Heading, Spinner, IconButton, HStack, Spacer } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/supabaseClient';
import { ArrowUpIcon, DeleteIcon } from '@chakra-ui/icons'; // <-- Importamos el DeleteIcon

// --- Tipos de Datos ---
type ThreadInfo = {
  thread_id: number;
  other_participant_id: string;
  other_participant_first_name: string;
  other_participant_last_name: string;
  other_participant_photo_url: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
  post_title?: string;
};

type Message = {
  id: number;
  thread_id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

// --- Componente Principal ---
const Chats = () => {
  const { threadId: paramThreadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, loading: authLoading } = useAuth();

  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efecto para cargar la lista de conversaciones
  useEffect(() => {
    const fetchUserThreads = async () => {
      if (!currentUserProfile?.user_id) return;

      setLoading(true);
      setError(null);

      try {
        const { data: fetchedThreads, error: threadsError } = await supabaseClient.rpc('get_user_threads');

        if (threadsError) throw threadsError;

        if (fetchedThreads && fetchedThreads.length > 0) {
          
          const threadIds = fetchedThreads.map((t: any) => t.thread_id);
          const { data: threadsPosts } = await supabaseClient
            .from('threads')
            .select('id, posts(title)')
            .in('id', threadIds);

          const enrichedThreads: ThreadInfo[] = fetchedThreads.map((thread: any) => {
            const threadExtra = threadsPosts?.find(tp => tp.id === thread.thread_id);
            const postTitle = threadExtra?.posts?.title || 'Publicación desconocida';
            
            return {
              ...thread,
              post_title: postTitle
            };
          });

          setThreads(enrichedThreads);
          
          if (paramThreadId) {
            const foundThread = enrichedThreads.find(t => t.thread_id === parseInt(paramThreadId));
            setSelectedThread(foundThread || enrichedThreads[0]);
          } else {
            setSelectedThread(enrichedThreads[0]);
          }
        } else {
          setThreads([]);
          setSelectedThread(null);
        }

      } catch (err: any) {
        console.error("Error fetching user threads:", err);
        setError("Error al cargar las conversaciones.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserProfile && !authLoading) {
      fetchUserThreads();
    }
  }, [currentUserProfile, authLoading, paramThreadId]);

  // Efecto para cargar los mensajes de la conversación seleccionada
  useEffect(() => {
    if (!selectedThread?.thread_id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setError(null);
      try {
        const { data, error: messagesError } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('thread_id', selectedThread.thread_id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(data || []);
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError("Error al cargar los mensajes.");
      }
    };

    fetchMessages();

    const channel = supabaseClient
      .channel(`thread_${selectedThread.thread_id}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${selectedThread.thread_id}` },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para enviar un mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserProfile?.user_id || !selectedThread?.thread_id) return;

    try {
      const { error } = await supabaseClient.from('messages').insert({
        thread_id: selectedThread.thread_id,
        sender_id: currentUserProfile.user_id,
        content: newMessage,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error al enviar el mensaje.");
    }
  };

 // --- FUNCIÓN MEJORADA: ELIMINAR CHAT ---
  const handleDeleteThread = async () => {
    if (!selectedThread) return;

    // Pedimos confirmación antes de borrar
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer y borrará todos los mensajes.");
    
    if (!confirmDelete) return;

    try {
      // PASO 1: Borrar todos los mensajes que pertenecen a este hilo primero
      const { error: messagesError } = await supabaseClient
        .from('messages')
        .delete()
        .eq('thread_id', selectedThread.thread_id);

      if (messagesError) {
        console.error("Error al borrar mensajes:", messagesError);
        throw new Error("No se pudieron borrar los mensajes previos.");
      }

      // PASO 2: Ahora que el hilo está vacío, lo borramos con seguridad
      const { error: deleteError } = await supabaseClient
        .from('threads')
        .delete()
        .eq('id', selectedThread.thread_id);

      if (deleteError) {
        console.error("Error al borrar el hilo:", deleteError);
        throw new Error("No se pudo borrar el chat.");
      }

      // PASO 3: Actualizamos la UI local quitando el chat borrado
      const updatedThreads = threads.filter(t => t.thread_id !== selectedThread.thread_id);
      setThreads(updatedThreads);
      
      // Limpiamos el panel derecho o pasamos al primer chat disponible
      if (updatedThreads.length > 0) {
        setSelectedThread(updatedThreads[0]);
        navigate(`/chats/${updatedThreads[0].thread_id}`, { replace: true });
      } else {
        setSelectedThread(null);
        navigate('/chats', { replace: true });
      }

    } catch (err) {
      console.error("Error eliminando la conversación completa:", err);
      alert("Hubo un error al intentar eliminar el chat. Revisa la consola para más detalles.");
    }
  };
  // ------------------------------------

  const handleSelectThread = (thread: ThreadInfo) => {
    setSelectedThread(thread);
    navigate(`/chats/${thread.thread_id}`, { replace: true });
  }

  if (authLoading || loading) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Spinner size="xl" /></Flex>;
  }
  if (error) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Text color="red.500">{error}</Text></Flex>;
  }
  if (!currentUserProfile) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Text>Por favor, inicia sesión para ver tus chats.</Text></Flex>;
  }

  return (
    <Flex h="calc(100vh - 160px)" bg="gray.50">
      
      {/* PANEL IZQUIERDO: Lista de Conversaciones */}
      <VStack w="350px" borderRight="1px" borderColor="gray.200" p={2} spacing={2} overflowY="auto" align="stretch">
        <Heading size="md" p={3}>Tus Conversaciones</Heading>
        {threads.length === 0 ? (
          <Text color="gray.500" p={3}>No tienes conversaciones aún.</Text>
        ) : (
          threads.map((thread) => (
            <Flex
              key={thread.thread_id}
              p={3} w="full" borderRadius="md"
              bg={selectedThread?.thread_id === thread.thread_id ? "#00569c" : "white"}
              color={selectedThread?.thread_id === thread.thread_id ? "white" : "black"}
              shadow="sm" cursor="pointer"
              _hover={{ bg: selectedThread?.thread_id === thread.thread_id ? "#00569c" : "gray.100" }}
              onClick={() => handleSelectThread(thread)}
              align="center"
            >
              <Avatar size="md" name={`${thread.other_participant_first_name} ${thread.other_participant_last_name}`} src={thread.other_participant_photo_url || ''} />
              
              <VStack align="flex-start" ml={3} spacing={0} flex="1" overflow="hidden">
                <Text fontWeight="bold" isTruncated w="full">
                  {`${thread.other_participant_first_name} ${thread.other_participant_last_name}`}
                </Text>
                
                <Text 
                  fontSize="xs" 
                  color={selectedThread?.thread_id === thread.thread_id ? "blue.100" : "blue.600"} 
                  fontWeight="bold" 
                  isTruncated w="full" mb={1}
                >
                  📦 {thread.post_title}
                </Text>

                <Text fontSize="sm" opacity={0.8} isTruncated w="full">
                  {thread.last_message_content || "Sin mensajes..."}
                </Text>
              </VStack>
            </Flex>
          ))
        )}
      </VStack>

      {/* PANEL DERECHO: Vista de Mensajes */}
      <Flex direction="column" flex="1">
        {selectedThread ? (
          <>
            {/* ENCABEZADO DEL CHAT ACTUAL */}
            <HStack p={4} borderBottom="1px" borderColor="gray.200" bg="white" spacing={4}>
              <Avatar size="sm" name={`${selectedThread.other_participant_first_name} ${selectedThread.other_participant_last_name}`} src={selectedThread.other_participant_photo_url || ''} />
              <VStack align="flex-start" spacing={0}>
                <Heading size="md">{`${selectedThread.other_participant_first_name} ${selectedThread.other_participant_last_name}`}</Heading>
                
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Sobre: {selectedThread.post_title}
                </Text>
              </VStack>

              <Spacer /> {/* Empuja el botón hacia la derecha */}

              {/* BOTÓN PARA ELIMINAR EL CHAT */}
              <IconButton
                aria-label="Eliminar chat"
                icon={<DeleteIcon />}
                colorScheme="red"
                variant="ghost"
                onClick={handleDeleteThread}
                title="Eliminar esta conversación"
              />
            </HStack>

            {/* ZONA DE MENSAJES */}
            <Flex direction="column" flex="1" overflowY="auto" p={4}>
              {messages.map((message) => (
                <Flex key={message.id} justify={message.sender_id === currentUserProfile.user_id ? 'flex-end' : 'flex-start'} mb={3}>
                  <Box
                    bg={message.sender_id === currentUserProfile.user_id ? '#00569c' : 'gray.200'}
                    color={message.sender_id === currentUserProfile.user_id ? 'white' : 'black'}
                    px={4} py={2} borderRadius="20px" maxW="70%"
                  >
                    <Text>{message.content}</Text>
                  </Box>
                </Flex>
              ))}
              <div ref={messagesEndRef} />
            </Flex>

            {/* INPUT PARA ENVIAR */}
            <Flex p={4} borderTop="1px" borderColor="gray.200" bg="white">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                mr={2}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                borderRadius="20px"
                bg="gray.100"
              />
              <IconButton
                isRound
                colorScheme="blue" bg="#00569c"
                aria-label="Enviar mensaje"
                icon={<ArrowUpIcon />}
                onClick={handleSendMessage}
                isDisabled={!newMessage.trim()}
              />
            </Flex>
          </>
        ) : (
          <Flex justify="center" align="center" flex="1">
            <Text color="gray.500">Selecciona una conversación para empezar a chatear.</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Chats;