export type PostProps = {
    id: number;
    status: 'lost' | 'found';
    imageUrl: string;
    altText: string;
    title: string;
    date: string;
    location: string;
    description: string;
    userId: string;
    thread: string;
};

export type ThreadProps = {
    id: string;
    postId: number;
    objectOwnerId: string;
    finderId: string;
};

export type MessageProps = {
    id: string;
    threadId: string;
    senderId: string;
    content: string;
    timestamp: string;
}

