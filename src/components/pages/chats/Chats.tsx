import { useState, useEffect, useRef } from 'react';
import { Box, Flex, VStack, Text, Input, Button, Avatar, Heading, Spinner, Divider, IconButton, HStack } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/supabaseClient';
import { ArrowUpIcon } from '@chakra-ui/icons';

// --- Tipos de Datos ---
// Definimos los tipos aquí para evitar los problemas de importación anteriores.

// El tipo de dato que devuelve nuestra nueva función RPC get_user_threads
type ThreadInfo = {
  thread_id: number;
  other_participant_id: string;
  other_participant_first_name: string;
  other_participant_last_name: string;
  other_participant_photo_url: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
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
          setThreads(fetchedThreads);
          
          // Seleccionar la conversación basada en el parámetro de la URL o la primera de la lista
          if (paramThreadId) {
            const foundThread = fetchedThreads.find(t => t.thread_id === parseInt(paramThreadId));
            setSelectedThread(foundThread || fetchedThreads[0]);
          } else {
            setSelectedThread(fetchedThreads[0]);
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

  // Efecto para cargar los mensajes de la conversación seleccionada y suscribirse en tiempo real
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

    // Suscripción a nuevos mensajes en tiempo real
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

  // Efecto para hacer scroll hacia el último mensaje
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

  const handleSelectThread = (thread: ThreadInfo) => {
    setSelectedThread(thread);
    // Actualiza la URL sin recargar la página para una mejor UX
    navigate(`/chats/${thread.thread_id}`, { replace: true });
  }

  // Renderizado de estados de carga y error
  if (authLoading || loading) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Spinner size="xl" /></Flex>;
  }
  if (error) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Text color="red.500">{error}</Text></Flex>;
  }
  if (!currentUserProfile) {
    return <Flex justify="center" align="center" h="calc(100vh - 160px)"><Text>Por favor, inicia sesión para ver tus chats.</Text></Flex>;
  }

  // Renderizado principal
  return (
    <Flex h="calc(100vh - 160px)" bg="gray.50">
      {/* Panel Izquierdo: Lista de Conversaciones */}
      <VStack w="350px" borderRight="1px" borderColor="gray.200" p={2} spacing={2} overflowY="auto" align="stretch">
        <Heading size="md" p={3}>Tus Conversaciones</Heading>
        {threads.length === 0 ? (
          <Text color="gray.500" p={3}>No tienes conversaciones aún.</Text>
        ) : (
          threads.map((thread) => (
            <Flex
              key={thread.thread_id}
              p={3}
              w="full"
              borderRadius="md"
              bg={selectedThread?.thread_id === thread.thread_id ? "brand.blue" : "white"}
              color={selectedThread?.thread_id === thread.thread_id ? "white" : "black"}
              shadow="sm"
              cursor="pointer"
              _hover={{ bg: selectedThread?.thread_id === thread.thread_id ? "brand.blue" : "gray.100" }}
              onClick={() => handleSelectThread(thread)}
              align="center"
            >
              <Avatar size="md" name={`${thread.other_participant_first_name} ${thread.other_participant_last_name}`} src={thread.other_participant_photo_url || ''} />
              <VStack align="flex-start" ml={3} spacing={0} flex="1" isTruncated>
                <Text fontWeight="bold">{`${thread.other_participant_first_name} ${thread.other_participant_last_name}`}</Text>
                <Text fontSize="sm" opacity={0.8} noOfLines={1}>{thread.last_message_content || "..."}</Text>
              </VStack>
            </Flex>
          ))
        )}
      </VStack>

      {/* Panel Derecho: Vista de Mensajes */}
      <Flex direction="column" flex="1">
        {selectedThread ? (
          <>
            <HStack p={4} borderBottom="1px" borderColor="gray.200" bg="white" spacing={4}>
              <Avatar size="sm" name={`${selectedThread.other_participant_first_name} ${selectedThread.other_participant_last_name}`} src={selectedThread.other_participant_photo_url || ''} />
              <Heading size="md">{`${selectedThread.other_participant_first_name} ${selectedThread.other_participant_last_name}`}</Heading>
            </HStack>

            <Flex direction="column" flex="1" overflowY="auto" p={4}>
              {messages.map((message) => (
                <Flex key={message.id} justify={message.sender_id === currentUserProfile.user_id ? 'flex-end' : 'flex-start'} mb={3}>
                  <Box
                    bg={message.sender_id === currentUserProfile.user_id ? 'brand.yellow' : 'gray.200'}
                    color={message.sender_id === currentUserProfile.user_id ? 'brand.blue' : 'black'}
                    px={4}
                    py={2}
                    borderRadius="20px"
                    maxW="70%"
                  >
                    <Text>{message.content}</Text>
                  </Box>
                </Flex>
              ))}
              <div ref={messagesEndRef} />
            </Flex>

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
                colorScheme="blue"
                aria-label="Send message"
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