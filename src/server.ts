import App from './app'
import * as dotenv from "dotenv"
import * as cors from 'cors'
dotenv.config();

if (!process.env.PORT) {
    process.exit(1);
}

import loggerMiddleware from './middlewares/logger'
import HomeController from './controllers/home.controller'

const app = new App({
    port: parseInt(process.env.PORT),
    controllers: [
        new HomeController(),
    ],
    middleWares: [
        // bodyParser.json(),
        // bodyParser.urlencoded({ extended: true }),
        // cors(),
        loggerMiddleware
    ]
})

app.listen()
