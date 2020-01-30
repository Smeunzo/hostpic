import {PictureModel} from "./PictureModel";
import {Db, ObjectId} from "mongodb";
import {Picture} from "./Picture";
import {User} from "../auth/User";
import * as fs from "fs";
import * as path from "path";
import {Request} from "express";
import Jimp = require("jimp");
import {Utils} from "../../utils/Utils";


export class PictureModelImpl implements PictureModel {


    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * @see PictureModel/newPictureAdded
     */
    async newPictureAdded(file: Request['file'], user: User): Promise<void> {
        await this.uploadPicturesInformationsToDb(file, user);
        this.moveFileToFolder(file, user);
        await this.resizePicture(user, file);
    }

    /**
     * @see PictureModel/uploadPicturesInformationsToDb
     * @param file
     * @param user
     */
    async uploadPicturesInformationsToDb(file: Request['file'], user: User): Promise<ObjectId> {

        if (!user) throw Error("Envoie du fichier impossible, l'utilisateur n'est pas connecté");
        if (!file) throw Error("Envoie du fichier impossible, il y a une erreur avec le fichier");

        const picture: Picture = {
            name: file.originalname,
            createdAt: new Date(Date.now()),
            path: "/pictures/" + user.username + '/' + file.originalname,
            size: file.size
        };
        const result = await this.db.collection('pictures').insertOne({userId: user._id, picture: picture});
        return result.insertedId;
    }

    moveFileToFolder(file: Request['file'], user: User): void {
        if (!user) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        this.movePictureToTheCorrespondingUsersFolder(user,file);
    }


    /**
     * @context if you need it
     *      @see PictureModel/moveFileToFolder
     *
     * Move the file which is in the folder upload/pictures
     * to upload/pictures/{user.username}
     *
     * @throws Error if the currentPath is false or undefined
     * @throws Error if the destPath is false or undefined
     *
     * @param user
     * @param file
     */
    private movePictureToTheCorrespondingUsersFolder(user : User , file : Request['file']) : void {

        const currentPath = path.join(Utils.__pathToStorage,'/',file.originalname);
        const destPath = path.join(Utils.__pathToStorage,'/',user.username,'/',file.originalname);

        fs.rename(currentPath,destPath,(err)=>{
            if(err) throw Error(err.message + "déplacement de fichiers impossible");
        });
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Resize the picture uploaded by the user
     *
     * @param user
     * @param file
     */
    private async resizePicture(user: User, file: any) {
        const pathToFile: string = path.join(Utils.__pathToStorage, user.username, '/', file.originalname);
        const image = await Jimp.read(pathToFile);
        //286 because it's the basic size for a bootstrap card element
        await image.resize(286, Jimp.AUTO);
        await image.writeAsync(pathToFile);
    }

    /**
     *@see PictureModel/findUsersPictures
     */
    async findUsersPictures(userId: any): Promise<any[]> {
        if (userId == undefined) throw Error("Impossible de récupérer les photos vous n'êtes pas connecté");

        return await this.db.collection('pictures').find({userId: userId}).toArray();
    }

    /**
     * @see PictureModel/deleteFile
     * @param pictureId
     * @param user
     */
    async deleteFile(pictureId: ObjectId, user: User): Promise<void> {
        try {
            const picturesInformation = await this.deleteFileFromDB(pictureId);
            await this.deletePictureFromUsersFolder(picturesInformation,user);
        } catch (errors) {
            throw errors;
        }
    }

    /**
     * it removes the picture's information from the database
     * @param pictureId
     *
     * @return An Object which looks like this { _id : ObjectId ,userId : ObjectId , picture : Picture}
     */
    private async deleteFileFromDB(pictureId: ObjectId): Promise<any> {
        return (await this.db.collection('pictures').findOneAndDelete({_id: pictureId})).value
    }


    /**
     * it removes the file from the user's folder.
     *
     * @throws Error if pictureInformations is invalid
     * @param pictureInformations An object which has been returned by the method deleteFileFromDB.
     * @param user
     */
    private async deletePictureFromUsersFolder(pictureInformations : any , user : User) : Promise<void>{
        if (!pictureInformations.picture || !pictureInformations.userId || !pictureInformations._id) throw Error("Impossible de supprimer cette image");

        const pictures: any[] = await this.db.collection('pictures').find({userId: new ObjectId(user._id)}).toArray();

        let existInDB = 0;
        for (let picture of pictures) {
            if (picture.picture.name == pictureInformations.picture.name) {
                existInDB = 1;
                break;
            }
        }

        if (existInDB == 0) {
            const pathToPicture = path.join(Utils.__pathToStorage,'/',user.username,'/',pictureInformations.picture.name);
            fs.unlink(pathToPicture, (err) => {
                if (err) throw err
            })
        }
    }

    /**
     * @see PictureModel/findLastPicture
     * @param user
     * @return object {_id : ,userId : , picture : {} }
     */
    async findLastPicture(user: User): Promise<any> {
        const picture : any[] = await this.db.collection('pictures').find({userId : new ObjectId(user._id)}).toArray();
        let oldestPict = picture[0];

        for(let i = 1;i < picture.length ;i++ ){
           if(oldestPict.picture.createdAt < picture[i].picture.createdAt){
               oldestPict = picture[i];
           }
        }
        return oldestPict;
    }

}