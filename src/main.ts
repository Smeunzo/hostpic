import * as express from "express";
import * as bodyParser from "body-parser";
import {HomeController} from "./controllers/HomeController";
import {Db, MongoClient} from "mongodb";
import {AuthController} from "./controllers/auth/AuthController";
import {AuthModel} from "./models/auth/AuthModel";
import {AuthModelImpl} from "./models/auth/AuthModelImpl";
import session = require("express-session");


async function start() {
     const mongoClient = await MongoClient.connect('mongodb://localhost',{useUnifiedTopology : true});
     const db : Db = mongoClient.db('project');

    const homeController = new HomeController();

    const authModel : AuthModel = new AuthModelImpl(db);
    const authController = new AuthController(authModel,'/auth/login');


    const myExpress = express();
    myExpress.set('view engine','pug');

    myExpress.use(session({
        secret :'aaaa',
        resave : false,
        saveUninitialized : false,
        cookie :{
            maxAge : 1000 * 60 * 10,
            httpOnly : true
        }
    }));

    myExpress.use(bodyParser.urlencoded({ extended: true }));

    myExpress.use(authController.getUser.bind(authController));
    myExpress.use('/', homeController.router());
    myExpress.use('/auth',authController.router());
    myExpress.use(express.static('public'));
    myExpress.listen(4200, function () {
        console.log('Go to http://localhost:4200')
    });
}

start().then();

