import {Request, Response, Router, NextFunction, request} from "express";



export class HomeController {


    router() : Router{
        const router =  Router();
        router.get('/',this.getHomePage.bind(this));
        return router;
    }


    private getHomePage(request : Request, response : Response, next : NextFunction) : void{
        response.render('home');
    }
}

