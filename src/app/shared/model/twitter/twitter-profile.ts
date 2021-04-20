// Internal dependencies
import Position from "../position/position";


export default interface TwitterProfile
{
    id: number;
    name: string;
    username: string;

    position: Position;
}