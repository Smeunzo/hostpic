import {NextFunction, Request, Response, Router} from "express";
import {AuthController} from "../auth/AuthController";
import { ObjectId } from "mongodb";

export class PictureController {




    router(authController: AuthController): Router {
        const router = Router();
        //router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/:username/:picName', this.getPicture.bind(this));
        return router;
    }

    private async getPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            if (request.session && request.session.userId) {
                const idSession = new ObjectId(request.session.userId);
                const idUser = new ObjectId(response.locals.loggedUser._id);
                if (idSession.toHexString() === idUser.toHexString()) {
                    console.log(request.params.picName);
                    response.sendFile('/home/afissad/albumPhotoProject/projet/resr/'+request.params.picName);
                } else response.redirect(404, request.baseUrl);
            } else response.redirect(404, request.baseUrl);
        } catch (errors) {

        }
    }
}