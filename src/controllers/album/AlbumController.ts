import {NextFunction, Request, Response, Router} from "express";
import {PictureModel} from "../../models/picture/PictureModel";
import  multer = require("multer");

export class AlbumController {

    private picturemodel: PictureModel;
    private upload: any;


    constructor(pictureModel: PictureModel) {
        this.picturemodel = pictureModel;
        this.instantiateUpload();
    }

    router(): Router {
        const router = Router();
        router.get('/upload', this.getAddPicture.bind(this));
        router.post('/upload', this.upload.single('image'), this.postAddPicture.bind(this));
        router.get('/mypictures', this.getMyPictures.bind(this));
        return router;
    }

    private getAddPicture(request: Request, response: Response, nextFunction: NextFunction) {

        response.render('addPicForm', {token: request.csrfToken()});
    }

    private async postAddPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            console.log(request.body._csrf);
            await this.picturemodel.uploadFile(request.file, response.locals.loggedUser._id);
            response.redirect('/album/mypictures')
        } catch (errors) {
            response.render('addPicForm', {token: request.csrfToken(), errors: errors})
        }
    }

    private async getMyPictures(request: Request, response: Response, nextFunction: NextFunction) {

        try {
            const pictures: string[] = await this.picturemodel.findUsersPictures(response.locals.loggedUser._id);
            response.render('pictures', {pictures: pictures})
        }catch (errors) {
            response.render('pictures',{errors : errors})
        }
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