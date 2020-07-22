import App from './app'
import * as dotenv from "dotenv"
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
        loggerMiddleware
    ]
})

app.listen()
