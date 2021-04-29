// Internal dependencies
import { Position } from "../position/position";


export interface TwitterCommunity
{
    id: number;
    
    name?: string;
    size: number;

    members: string[];
    centroid: Position;
}