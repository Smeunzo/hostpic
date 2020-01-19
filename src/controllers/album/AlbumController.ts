import {NextFunction, Request, Response, Router} from "express";
import {PictureModel} from "../../models/picture/PictureModel";
import  multer = require("multer");
import {AuthController} from "../auth/AuthController";
import {ObjectId} from "mongodb";

export class AlbumController {

    private pictureModel: PictureModel;
    private upload: any;


    constructor(pictureModel: PictureModel) {
        this.pictureModel = pictureModel;
        this.instantiateUpload();
    }

    router(authController: AuthController): Router {
        const router = Router();
        router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/', this.redirectToUploadPage.bind(this));
        router.get('/upload', this.getAddPicture.bind(this));
        router.post('/upload', this.upload.single('image'), this.postAddPicture.bind(this));
        router.post('/delete/:id', this.postDelete.bind(this));
        router.get('/mypictures', this.getMyPictures.bind(this));
        return router;
    }


    private getAddPicture(request: Request, response: Response, nextFunction: NextFunction) {

        response.render('upload', {token: request.csrfToken()});
    }

    private async postAddPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            await this.pictureModel.newPictureAdded(request.file, response.locals.loggedUser);
            response.redirect('/album/mypictures')
        } catch (errors) {
            response.render('upload', {token: request.csrfToken(), errors: errors})
        }
    }

    private async getMyPictures(request: Request, response: Response, nextFunction: NextFunction) {

        try {
            const photo: any[] = await this.pictureModel.findUsersPictures(response.locals.loggedUser._id);
            response.render('pictures', {pictures: photo, token: request.csrfToken()})
        } catch (errors) {
            response.render('pictures', {errors: errors})
        }
    }

    private async postDelete(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            await this.pictureModel.deleteFile(new ObjectId(request.params.id), response.locals.loggedUser);
            response.redirect('/album/mypictures')
        } catch (errors) {
            const photo: any[] = await this.pictureModel.findUsersPictures(response.locals.loggedUser);
            response.render('pictures', {errors: errors, pictures: photo, token: request.csrfToken()})
        }
    }

    private redirectToUploadPage(request: Request, response: Response, nextFunction: NextFunction) {
        response.redirect('/album/upload');
    }


    private instantiateUpload() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/pictures');
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        });
        this.upload = multer({storage: storage});
    }
}