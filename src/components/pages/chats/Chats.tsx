import {
    Avatar,
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Text,
    VStack,
    Divider,
    Center,
} from '@chakra-ui/react';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSchemas } from '../lostobjects/hooks/useSchemas';
import { users } from '../lostobjects/data/users';
import type { UserProps } from '@/types';

export default function Chats() {
    const { profile } = useAuth();
    const { threads, sampleMessages } = useSchemas();

    const chatPartners = useMemo(() => {
        if (!profile) return [];
        const userThreads = threads.filter(
            (t) => t.objectOwnerId === profile.user_id || t.finderId === profile.user_id
        );
        const partners = userThreads.map((t) => {
            const partnerId = t.objectOwnerId === profile.user_id ? t.finderId : t.objectOwnerId;
            return users.find((u) => u.id === partnerId);
        }).filter((user): user is UserProps => !!user);
        return [...new Map(partners.map((item) => [item.id, item])).values()];
    }, [threads, profile]);

    const [selectedChat, setSelectedChat] = useState<UserProps | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');

    // Efecto para seleccionar el primer chat por defecto
    useEffect(() => {
        if (chatPartners.length > 0 && !selectedChat) {
            handleSelectChat(chatPartners[0]);
        }
    }, [chatPartners, selectedChat]);

    const handleSelectChat = (user: UserProps) => {
        setSelectedChat(user);
        if (!profile) {
            setMessages([]);
            return;
        }

        const currentThread = threads.find(t =>
            (t.objectOwnerId === profile.user_id && t.finderId === user.id) ||
            (t.finderId === profile.user_id && t.objectOwnerId === user.id)
        );

        if (currentThread) {
            const threadMessages = sampleMessages
                .filter(m => m.threadId === currentThread.id)
                .map(m => ({
                    id: m.id,
                    text: m.content,
                    sender: m.senderId === profile.user_id ? 'me' : m.senderId
                }));
            setMessages(threadMessages);
        } else {
            setMessages([]);
        }
    };

    const handleSendMessage = () => {
        if (inputValue.trim() && selectedChat && profile) {
            const newMessage = {
                id: `msg-${Date.now()}`,
                text: inputValue,
                sender: 'me',
            };
            setMessages([...messages, newMessage]);
            setInputValue('');
        }
    };

    return (
        <Flex h="calc(100vh - 120px)" p={4} gap={4}>
            <VStack
                w={{ base: '100%', md: '300px' }}
                h="100%"
                borderWidth="1px"
                borderRadius="lg"
                p={2}
                spacing={2}
                align="stretch"
                overflowY="auto"
                bg="white"
            >
                <Heading size="md" p={2}>Chats</Heading>
                <Divider />
                {chatPartners.length > 0 ? (
                    chatPartners.map((user) => (
                        <Flex
                            key={user.id}
                            p={3}
                            borderRadius="md"
                            align="center"
                            cursor="pointer"
                            bg={selectedChat?.id === user.id ? 'gray.200' : 'transparent'}
                            _hover={{ bg: 'gray.100' }}
                            onClick={() => handleSelectChat(user)}
                        >
                            <Avatar size="sm" src={user.photoUrl} name={user.fullName} />
                            <Text ml={3} fontWeight="medium">{user.fullName}</Text>
                        </Flex>
                    ))
                ) : (
                    <Center h="100%">
                        <Text color="gray.500">No tienes chats activos.</Text>
                    </Center>
                )}
            </VStack>

            <Flex
                flex="1"
                direction="column"
                h="100%"
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
            >
                {selectedChat ? (
                    <>
                        <Flex p={4} borderBottomWidth="1px" align="center">
                            <Avatar size="sm" src={selectedChat.photoUrl} name={selectedChat.fullName} />
                            <Heading size="md" ml={3}>{selectedChat.fullName}</Heading>
                        </Flex>

                        <VStack flex="1" p={4} spacing={4} overflowY="auto" align="stretch">
                            {messages.map((msg) => (
                                <Flex
                                    key={msg.id}
                                    justify={msg.sender === 'me' ? 'flex-end' : 'flex-start'}
                                >
                                    <Box
                                        bg={msg.sender === 'me' ? '#00569c' : 'gray.200'}
                                        color={msg.sender === 'me' ? 'white' : 'black'}
                                        px={4} py={2} borderRadius="lg" maxW="70%"
                                    >
                                        {msg.text}
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>

                        <Flex p={4} borderTopWidth="1px" gap={2}>
                            <Input
                                placeholder="Escribe un mensaje"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button
                                onClick={handleSendMessage}
                                bg="#00569c"
                                color="white"
                                _hover={{ bg: '#1A3258' }}
                            >
                                Enviar
                            </Button>
                        </Flex>
                    </>
                ) : (
                    <Center h="100%">
                        <Text color="gray.500">Selecciona un chat para ver los mensajes.</Text>
                    </Center>
                )}
            </Flex>
        </Flex>
    );
}