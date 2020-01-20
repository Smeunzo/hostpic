import {NextFunction, Request, Response, Router} from "express";
import {AuthController} from "../auth/AuthController";
import {ObjectId} from "mongodb";
import {Utils} from "../../utils/Utils";
import * as path from "path";

export class PictureController {


    router(authController: AuthController): Router {
        const router = Router();
        router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/:username/:picName', this.getPicture.bind(this));
        return router;
    }

    // noinspection JSMethodCanBeStatic
    private async getPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            if (request.session && request.session.userId) {

                const idSession = new ObjectId(request.session.userId);
                const idUser = new ObjectId(response.locals.loggedUser._id);

                if (idSession.toHexString() === idUser.toHexString() &&
                    response.locals.loggedUser.username === request.params.username) {

                    const pathToFile: string = path.join(Utils.__absolutePathToStorage,
                        request.params.username, request.params.picName);

                    response.sendFile(pathToFile);
                } else response.sendStatus(403);
            } else response.sendStatus(401);
        } catch (errors) {
            throw errors;
        }
    }
}