import {AuthController} from "../auth/AuthController";
import {NextFunction, Request, Response, Router} from "express";
import {AdminModel} from "../../models/admin/AdminModel";


export class AdminController{

    private adminModel : AdminModel;
    constructor(amdinModel : AdminModel) {
        this.adminModel = amdinModel;
    }

    router(authController : AuthController) : Router{
        const router = Router();
        router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/', this.getRacine.bind(this));
        return router;
    }


    private async getRacine(request : Request , response : Response ,nextFunction : NextFunction){
        const table = await this.adminModel.getUsers();
        response.render('adminPanel',{table : table})
    }
}