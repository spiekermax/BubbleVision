// Internal dependencies
import { Position } from "../../position/position";


export interface TwitterProfile
{
    id: number;

    communityId?:
    {
        asString: string;
        asNumber: number;
    }
    communityHotspotId?: string;

    name: string;
    username: string;
    description: string;

    verified: boolean;
    imageUrl: string;

    followerCount: number;
    followeeCount: number;

    position: Position;
    isLandmark: boolean;
}