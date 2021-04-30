export interface TwitterCommunity
{
    id: number;
    
    name?: string;
    size: number;

    members: string[];
    clusters: any[];
}