import * as express from "express";
import {Request , Response} from "express";
import { HomeController} from "./controllers/HomeController";
import {MongoClient} from "mongodb";
import {AuthController} from "./controllers/auth/AuthController";
import {AuthModel} from "./models/auth/AuthModel";
import {AuthModelImpl} from "./models/auth/AuthModelImpl";


async function start() {
     const mongoClient = await MongoClient.connect('mongodb://localhost',{useUnifiedTopology : true});
     const db = mongoClient.db('album_photo');
    // //initialiser les modèles
    const authModel : AuthModel = new AuthModelImpl(db);
    const homeController = new HomeController();
    const authController = new AuthController(authModel);
    const myExpress = express();
    myExpress.set('view engine','pug');
    myExpress.use('/', homeController.router());
    myExpress.use('/auth',authController.router());
    myExpress.use(express.static('public'));
    myExpress.listen(4200, function () {
        console.log('Go to http://localhost:4200')
    });
}

start().then();


