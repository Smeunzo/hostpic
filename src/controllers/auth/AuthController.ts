import {AuthModel} from "../../models/auth/AuthModel";
import {NextFunction, Request, Response, Router} from "express";


export class AuthController {

    private model: AuthModel;

    private readonly loginRoute: string;
    private readonly authUrl: string;

    constructor(authModel: AuthModel, logInRedirection: string,authUrl : string) {
        this.model = authModel;
        this.loginRoute = logInRedirection;
        this.authUrl = authUrl;
    }

    router(): Router {
        const router = Router();
        router.get('/', this.redirectToLoginPage.bind(this));
        router.get('/login', this.getLogin.bind(this));
        router.post('/login', this.postLogin.bind(this));
        router.get('/signUp', this.getSignUp.bind(this));
        router.post('/signUp', this.postSignUp.bind(this));
        router.get('/logout', this.getLogOut.bind(this));
        return router;
    }

    private async getLogin(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if(response.locals.loggedUser){
            response.redirect('/');
            return;
        }else
        response.render('logIn', {logInData: {body: undefined , token : request.csrfToken()}});
    }

    private async postLogin(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        try {
            request.session.userId = await this.model.getUserId(request.body);
            response.redirect(this.loginRoute);
        } catch (errors) {
            response.render('logIn', {logInData: {body: request.body , token : request.csrfToken()}, errors: errors})
        }
    }

    private async getSignUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if(response.locals.loggedUser){
            response.redirect('/');
            return;
        }
        response.render('signUp', {logInData: {body: undefined , token : request.csrfToken()}});
    }

    private async postSignUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        try {
            request.session.userId = await this.model.signUp(request.body);
            response.redirect(this.loginRoute)
        } catch (errors) {
            response.render('signUp', {logInData: {body : request.body , token : request.csrfToken()}, errors: errors})
        }
    }

    private async getLogOut(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        request.session.destroy(() => {
            response.redirect('/')
        })
    }


    public async redirectUnLoggedUser(request: Request, response: Response, next: NextFunction): Promise<void> {
        if (response.locals.loggedUser == null) {
            response.redirect(this.authUrl+'/login');
            return;
        }
        next();
    }

    public async getUser(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            response.locals.loggedUser = (request.session && request.session.userId)
                ? await this.model.getUserFromId(request.session.userId)
                : null;
            next();
        } catch (error) {
            next(error);
        }
    }

    private async redirectToLoginPage(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        response.redirect(this.authUrl+'/login');
    }

}