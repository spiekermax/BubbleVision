// Internal dependencies
import Position from "../position/position";
import TwitterCommunity from "./twitter-community";


export default interface TwitterProfile
{
    id: number;

    name: string;
    username: string;
    position: Position;

    community: TwitterCommunity;
}