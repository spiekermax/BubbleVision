export interface TwitterCommunityHotspot
{
    name: string;
    size: number;
    
    // TODO: Give this type 'Position'
    centroid: [number, number];
    radius: number;
}