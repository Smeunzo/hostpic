import * as express from "express";
import * as bodyParser from "body-parser";

import {HomeController} from "./controllers/HomeController";
import {Db, MongoClient} from "mongodb";
import {AuthController} from "./controllers/auth/AuthController";
import {AuthModel} from "./models/auth/AuthModel";
import {AuthModelImpl} from "./models/auth/AuthModelImpl";
import {AlbumController} from "./controllers/album/AlbumController";
import {PictureModelImpl} from "./models/picture/PictureModelImpl";

import session = require("express-session");
import cookieParser = require("cookie-parser");
import csurf = require("csurf");
import connectMongoDbStore = require("connect-mongodb-session");

async function start() {
     const mongoClient = await MongoClient.connect('mongodb://localhost',{useUnifiedTopology : true});
     const db : Db = mongoClient.db('project');

    const homeController = new HomeController();

    const pictureModel = new PictureModelImpl(db);
    const albumController = new AlbumController(pictureModel);

    const authModel : AuthModel = new AuthModelImpl(db);
    const authController = new AuthController(authModel,'/album','/auth');

    const myExpress = express();
    myExpress.set('view engine','pug');
    const MongoDbStore = connectMongoDbStore(session);
    const storageSession = new MongoDbStore({
        uri : 'mongodb://localhost',
        databaseName : 'project',
        collection: 'sessions'
    });

    myExpress.use(session({
        secret :'aaaa',
        resave : false,
        saveUninitialized : false,
        store: storageSession,
        cookie :{
            maxAge : 1000 * 60 * 60, // session d'1 heure
            httpOnly : true
        }
    }));

    myExpress.use(bodyParser.urlencoded({ extended: true }));

    myExpress.use(cookieParser());
    myExpress.use(csurf({
        cookie : {
            key: '_csrf',
            secure: false,
            httpOnly : true,
            sameSite: true,
            maxAge : 1000 * 60 * 60
        }
    }));

    myExpress.use(authController.getUser.bind(authController));
    myExpress.use('/', homeController.router());
    myExpress.use('/auth',authController.router());
    myExpress.use('/album',albumController.router(authController));
    myExpress.use(express.static('public'));
    myExpress.listen(4200, function () {
        console.log('Go to http://localhost:4200')
    });
}

start().then();

