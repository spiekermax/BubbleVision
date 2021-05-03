// Internal dependencies
import { TwitterCommunityHotspot } from "./twitter-community-hotspot";


export interface TwitterCommunity
{
    id: number;
    
    name?: string;
    size: number;

    members: string[];
    hotspots: Record<string, TwitterCommunityHotspot[]>;
}