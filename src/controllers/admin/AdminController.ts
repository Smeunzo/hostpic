import {AuthController} from "../auth/AuthController";
import {NextFunction, Request, Response, Router} from "express";
import {AdminModel} from "../../models/admin/AdminModel";
import { ObjectId } from "mongodb";


export class AdminController{

    private adminModel : AdminModel;
    constructor(adminModel : AdminModel) {
        this.adminModel = adminModel;
    }

    router(authController : AuthController) : Router{
        const router = Router();
        router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/userControl', this.getRacine.bind(this));
        router.post('/userControl/delete/:id',this.deleteUser.bind(this));
        return router;
    }


    private async getRacine(request : Request , response : Response ,nextFunction : NextFunction){
        const table = await this.adminModel.getUsers();
        response.render('adminPanel',{table : table ,token : request.csrfToken()})
    }

    private async deleteUser(request : Request, response : Response , nextFunction : NextFunction){
        try{
            await this.adminModel.deleteUser(new ObjectId(request.params.id));
            response.redirect('/admin/userControl');
        }catch (errors) {
            const table = await this.adminModel.getUsers();
            response.render('adminPanel', {table : table , token : request.csrfToken(), errors : errors})
        }
    }
}