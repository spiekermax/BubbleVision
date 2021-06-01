// Internal dependencies
import { TwitterCommunityHotspot } from "./twitter-community-hotspot";


export interface TwitterCommunity
{
    id: string;
    numericId: number;
    name: string;

    centroid: [number, number];
    radius: number;
    size: number;

    members: string[];
    hotspots: TwitterCommunityHotspot[];

    twitterList:
    {
        id: string;
        slug: string;
        author: string;
    };
}