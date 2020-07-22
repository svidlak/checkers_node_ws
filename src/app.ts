import * as express from 'express'
import {Request, Response} from "express"
import * as http from "http";
import Websocket from "./services/websocket";

class App {
    private readonly app: express.Application
    private readonly port: number
    private readonly server: any
    private websocket: any

    constructor(appInit: { port: number; middleWares: any; controllers: any; }) {
        this.app = express()
        this.port = appInit.port
        this.server = new http.Server(this.app)
        this.websocket = new Websocket(this.server)

        this.middlewares(appInit.middleWares)
        this.routes(appInit.controllers)
        this.assets()
        this.routeNotFoundHandler()
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach(middleWare => {
            this.app.use(middleWare)
        })
    }

    private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
        controllers.forEach(controller => {
            this.app.use('/', controller.router)
        })
    }

    private routeNotFoundHandler(){
        this.app.use( (req: Request, res: Response) => res.status(404).json({error: 'Route not found'}) )
    }

    private assets() {
        this.app.use(express.static('public'))
    }

    public listen() {
        this.server.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        })
    }
}

export default App;
