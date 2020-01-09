import * as express from "express";
import {Request , Response} from "express";
import {HomeController} from "./controllers/HomeController";
import {MongoClient} from "mongodb";


async function start() {
    // const mongoClient = await MongoClient.connect('mongodb://localhost',{useUnifiedTopology : true});
    // const db = mongoClient.db('album_photo');
    // //initialiser les modèles

    const homeController = new HomeController();

    const myExpress = express();
    myExpress.set('view engine','pug');
    myExpress.get('/', homeController.router());
    myExpress.use(express.static('public'));
    myExpress.listen(4200, function () {
        console.log('Go to http://localhost:4200')
    });
}

start().then();


