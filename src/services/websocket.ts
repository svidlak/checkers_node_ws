import * as socketIO from 'socket.io'
import IRoom from "../interfaces/IRoom.interface"
import Game from "./game"
import EPlayer from "../interfaces/EPlayer.enum"
import IBoard from "../interfaces/IBoard.interface"

class Websocket {
    private Io: socketIO.Server
    private connectedClients: socketIO.Socket[] = []
    private gameQueue: socketIO.Socket[] = []
    private rooms: Record<string, IRoom> = {}

    constructor(server: any) {
        this.Io = socketIO(server)
        this.Io.on('connection', this.connection)
    }

    private connection = (socket: socketIO.Socket) => {
        this.connectedClients.push(socket)
        this.gameQueue.push(socket)
        if(this.gameQueue.length == 2){
            this.startGame()
        }
        socket.on('updateBoard', this.updateBoard)
        socket.on('endGame', this.endGame)
        socket.on('disconnect', this.disconnect)
    }

    private startGame = () => {
        const board: IBoard[][] = new Game().getBoard()

        const room: IRoom = {
            name: (new Date().getTime()).toString(),
            players: {},
            board: board,
            turn: 1,
            winner: 0
        }
        this.gameQueue.forEach((socket: socketIO.Socket, index: number) => {
            socket.join(room.name)
            room.players[socket.id] = {
                id: socket.id,
                type: index ? EPlayer.black : EPlayer.white
            }
        });

        this.rooms[room.name] = room
        this.Io.to(room.name).emit('startGame', room)
        this.gameQueue.length = 0
    }

    private updateBoard = (room: IRoom) => {
        this.Io.to(room.name).emit('updateBoard', room)
    }

    private endGame = (room: IRoom) => {
        this.Io.to(room.name).emit('endGame', room)
        Object.keys(room.players).forEach( player => {
            const foundPlayer = this.connectedClients.find( socket => socket.id === player)
            if(foundPlayer) foundPlayer.leave(room.name)
        })
    }

    private disconnect = (socket: socketIO.Socket) => {
        const socketIndex = this.connectedClients.indexOf(socket)
        this.connectedClients.splice(socketIndex, 1)
    }
}

export default Websocket
