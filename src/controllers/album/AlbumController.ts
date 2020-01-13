import {NextFunction, Request, Response, Router} from "express";
import {PictureModel} from "../../models/picture/PictureModel";
import  multer = require("multer");
import {AuthController} from "../auth/AuthController";

export class AlbumController {

    private picturemodel: PictureModel;
    private upload: any;


    constructor(pictureModel: PictureModel) {
        this.picturemodel = pictureModel;
        this.instantiateUpload();
    }

    router(authController : AuthController): Router {
        const router = Router();
        router.use(authController.redirectUnLoggedUser.bind(authController));
        router.get('/',this.redirectToUploadPage.bind(this));
        router.get('/upload', this.getAddPicture.bind(this));
        router.post('/upload', this.upload.single('image'), this.postAddPicture.bind(this));
        router.post('/delete/:id',this.postDelete.bind(this));
        router.get('/mypictures', this.getMyPictures.bind(this));
        return router;
    }


    private getAddPicture(request: Request, response: Response, nextFunction: NextFunction) {

        response.render('addPicForm', {token: request.csrfToken()});
    }

    private async postAddPicture(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            await this.picturemodel.uploadFileToDB(request.file,response.locals.loggedUser);
            this.picturemodel.moveFileToFolder(request.file,response.locals.loggedUser);
            response.redirect('/album/mypictures')
        } catch (errors) {
            response.render('addPicForm', {token: request.csrfToken(), errors: errors})
        }
    }

    private async getMyPictures(request: Request, response: Response, nextFunction: NextFunction) {

        try {
            const photo: any[] = await this.picturemodel.findUsersPictures(response.locals.loggedUser);
            response.render('pictures', {pictures: photo , token : request.csrfToken()})
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

    private async postDelete(request: Request, response: Response, nextFunction: NextFunction){
        try {
           await this.picturemodel.supprimer(request.params.id);
           response.redirect('/album/mypictures')
        }catch (errors) {
            const photo: any[] = await this.picturemodel.findUsersPictures(response.locals.loggedUser);
            response.render('pictures',{errors : errors,pictures : photo , token : request.csrfToken()})
        }
    }

    private redirectToUploadPage(request: Request, response: Response, nextFunction: NextFunction){
        response.redirect('/album/upload');
    }
}