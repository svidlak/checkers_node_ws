import * as express from 'express'
import { Request, Response } from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'
import * as path from 'path'

class HomeController implements IControllerBase {
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/', this.index)
    }

    private index = (req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname + '/../../public/index.html'))
    }
}

export default HomeController
