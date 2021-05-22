export interface TwitterCommunityHotspot
{
    id: string;
    name: string;
    
    centroid: [number, number];
    radius: number;
    size: number;

    members: string[];
}