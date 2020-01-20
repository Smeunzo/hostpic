import {NextFunction, Request, Response, Router} from "express";
import {PictureModel} from "../../models/picture/PictureModel";
import  multer = require("multer");
import {AuthController} from "../auth/AuthController";
import {ObjectId} from "mongodb";
import {Utils} from "../../utils/Utils";

export class AlbumController {

    private pictureModel: PictureModel;
    private upload: any;


    constructor(pictureModel: PictureModel) {
        this.pictureModel = pictureModel;
        this.uploadStorage();
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


    // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    private getAddPicture(request: Request, response: Response, nextFunction: NextFunction) {
        response.render('upload', {token: request.csrfToken()});
    }
    //noinspection JSUnusedLocalSymbols
    private async postAddPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            await this.pictureModel.newPictureAdded(request.file, response.locals.loggedUser);
            response.redirect('/album/mypictures')
        } catch (errors) {
            response.render('upload', {token: request.csrfToken(), errors: errors})
        }
    }
    //noinspection JSUnusedLocalSymbols

    private async getMyPictures(request: Request, response: Response, nextFunction: NextFunction) {

        try {
            const photo: any[] = await this.pictureModel.findUsersPictures(response.locals.loggedUser._id);
            response.render('pictures', {pictures: photo, token: request.csrfToken()})
        } catch (errors) {
            response.render('pictures', {errors: errors})
        }
    }

    //noinspection JSUnusedLocalSymbols
    private async postDelete(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            await this.pictureModel.deleteFile(new ObjectId(request.params.id), response.locals.loggedUser);
            response.redirect('/album/mypictures')
        } catch (errors) {
            const photo: any[] = await this.pictureModel.findUsersPictures(response.locals.loggedUser);
            response.render('pictures', {errors: errors, pictures: photo, token: request.csrfToken()})
        }
    }
    //noinspection JSUnusedLocalSymbols,JSMethodCanBeStatic
    private redirectToUploadPage(request: Request, response: Response, nextFunction: NextFunction) {
        response.redirect('/album/upload');
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * @deprecated
     * NOT USED
     */
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

    private uploadStorage() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, Utils.__pathToStorage);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        });
        this.upload = multer({storage : storage});
    }
}