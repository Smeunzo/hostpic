import * as express from "express";
import {Request , Response} from "express";
import {HomeController} from "./controllers/HomeController";



const homeController = new HomeController();


const myExpress = express();
myExpress.set('view engine','pug');

myExpress.get('/', homeController.router());

myExpress.listen(4200, function () {
    console.log('Go to http://localhost:4200')
});
