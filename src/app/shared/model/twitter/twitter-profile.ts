// Internal dependencies
import Position from "../position/position";
import TwitterCommunity from "./twitter-community";


export default interface TwitterProfile
{
    id: number;

    name: string;
    username: string;
    verified: boolean;
    imageUrl: string;

    followerCount: number;
    followeeCount: number;

    position: Position;
    community: TwitterCommunity;
}