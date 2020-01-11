import {NextFunction, Request, Response, Router} from "express";
import {PictureModel} from "../../models/picture/PictureModel";
import  multer = require("multer");

export class AlbumController {

    private picturemodel : PictureModel;
    private upload : any;


    constructor(pictureModel : PictureModel) {
        this.picturemodel = pictureModel;
        this.instantiateUpload();
    }

    router(): Router{
        const router = Router();
        router.get('/upload',this.getAddPicture.bind(this));
        router.post('/upload',this.upload.single('image'),this.postAddPicture.bind(this));
        router.get('/mypictures',this.getMyPictures.bind(this));
        return router;
    }

    private getAddPicture(request : Request, response: Response,nextFunction : NextFunction ){
        response.render('addPicForm' );
    }

    private async postAddPicture(request : Request, response: Response,nextFunction : NextFunction){
        await this.picturemodel.uploadFile(request.file,response.locals.loggedUser._id);
        response.redirect('/album/upload')
    }

    private async getMyPictures(request : Request, response: Response,nextFunction : NextFunction){

        const pictures : string[] = await this.picturemodel.showPictures(response.locals.loggedUser._id);
        response.render('pictures',{pictures : pictures})
    }


    private instantiateUpload(){
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/pictures');
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        });
        this.upload = multer({storage : storage});
    }
}