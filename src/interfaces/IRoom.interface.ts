import IPlayer from "./IPlayer.interface";
import IBoard from "./IBoard.interface";

interface IRoom {
    name: string,
    players: Record<string, IPlayer>,
    board: IBoard[][],
    turn: number,
    winner: number
}

export default IRoom
