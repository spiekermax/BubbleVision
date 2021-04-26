// Internal dependencies
import { Position } from "../position/position";
import { TwitterCommunity } from "./twitter-community";


export interface TwitterProfile
{
    id: number;

    name: string;
    username: string;
    description: string;

    verified: boolean;
    imageUrl: string;

    followerCount: number;
    followeeCount: number;

    position: Position;
    community: TwitterCommunity;
}