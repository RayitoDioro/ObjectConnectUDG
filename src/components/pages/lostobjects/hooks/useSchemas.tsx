import { useState } from "react"
import { lostObjects } from "../data/posts"
import type { PostProps, ThreadProps } from "../data/types"

export const sampleThreads: ThreadProps[] = [
    {
        finderId:"adsdasdasd564asd",
        id:"51ebf4bc-1e44-4beb-8446-63bd32c36f69",
        objectOwnerId:"1e6b4623-4896-42bf-92dd-9ca5b789f474",
        postId:1
    }
]

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
]

export const useSchemas = () => {
    const [posts, setPosts] = useState<PostProps[]>(lostObjects)
    const [threads, setThreads] = useState<ThreadProps[]>(sampleThreads)

    function createThreaForPost(finderId: string, postId: number, objectOwnerId: string) {
        setThreads([
            ...threads,
            {
                id: crypto.randomUUID(),
                postId: postId,
                objectOwnerId: objectOwnerId,
                finderId: finderId
            }
        ])
    }


    return {
        posts,
        threads,
        createThreaForPost,
        sampleMessages
    }
}