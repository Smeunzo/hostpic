import {AuthModel} from "../../models/auth/AuthModel";
import {NextFunction, Request, Response, Router} from "express";


export class AuthController {
    private model: AuthModel ;

    constructor(authModel : AuthModel) {
        this.model = authModel;
    }

    router() : Router{
        const router = Router();
        router.get('/',this.getLogin.bind(this));
        router.get('/login',this.getLogin.bind(this));
        router.post('/login',this.postLogin.bind(this));
        router.get('/signup',this.getSignUp.bind(this));
        router.post('/signup',this.postSignUp.bind(this));
        return router;
    }

    private async getLogin(request : Request, response : Response,nextFunction : NextFunction) : Promise<void>{
        response.render('logIn',{logInData : undefined});
    }

    private async postLogin(request : Request, response : Response,nextFunction : NextFunction) : Promise<void>{

    }

    private async getSignUp(request : Request, response : Response,nextFunction : NextFunction) : Promise<void>{
        response.render('signUp',{logInData : undefined});
    }

    private async postSignUp(request : Request, response : Response,nextFunction : NextFunction) : Promise<void>{

    }
}