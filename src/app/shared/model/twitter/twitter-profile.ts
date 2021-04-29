// Internal dependencies
import { Position } from "../position/position";


export interface TwitterProfile
{
    id: number;
    communityId: number;

    name: string;
    username: string;
    description: string;

    verified: boolean;
    imageUrl: string;

    followerCount: number;
    followeeCount: number;

    position: Position;
}