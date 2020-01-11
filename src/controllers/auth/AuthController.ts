import {AuthModel} from "../../models/auth/AuthModel";
import {NextFunction, Request, Response, Router} from "express";


export class AuthController {

    private model: AuthModel;

    private readonly loginRoute: string;

    constructor(authModel: AuthModel, loginRoute: string) {
        this.model = authModel;
        this.loginRoute = loginRoute;
    }

    router(): Router {
        const router = Router();
        router.get('/', this.redirectToLoginPage.bind(this));
        router.get('/login', this.getLogin.bind(this));
        router.post('/login', this.postLogin.bind(this));
        router.get('/signUp', this.getSignUp.bind(this));
        router.post('/signUp', this.postSignUp.bind(this));
        router.get('/logout', this.getLogOut.bind(this));
        router.use(this.redirectToLoginPage.bind(this));
        return router;
    }


    /**
     * Cette méthode sera utile dans le cas ou
     * j'ai une partie administration et que je souhaite
     * rediriger un utilisateur non logger d'acceder à /admin
     *
     * @param request
     * @param response
     * @param next
     */
    public async redirectUnloggedUser(request: Request, response: Response, next: NextFunction): Promise<void> {
        if (response.locals.loggedUser == null) {
            response.redirect(this.loginRoute);
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

    private async getLogin(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if(response.locals.loggedUser){
            response.redirect('/');
            return;
        }
        response.render('logIn', {logInData: {body: undefined}});
    }

    private async postLogin(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        try {
            request.session.userId = await this.model.getUserId(request.body);
            response.redirect('/');
        } catch (errors) {
            response.render('logIn', {logInData: {body: request.body}, errors: errors})
        }
    }

    private async getSignUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if(response.locals.loggedUser){
            response.redirect('/');
            return;
        }
        response.render('signUp', {logInData: {body: undefined}});
    }

    private async postSignUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        try {
            request.session.userId = await this.model.signUp(request.body);
            response.redirect('/')
        } catch (errors) {
            response.render('signUp', {logInData: {body : request.body}, errors: errors})
        }
    }

    private async redirectToLoginPage(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        response.redirect(this.loginRoute);
    }

    private async getLogOut(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        if (!request.session) throw Error("Les cookies doivent être activés");
        request.session.destroy(() => {
            response.redirect('/auth/login')
        })
    }
}