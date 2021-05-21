export interface Tweet
{
    id: string;
    author:
    {
        name: string;
        username: string;
        verified: boolean;
        imageUrl: string;
    };
    text: string;
    timestamp: number;
}