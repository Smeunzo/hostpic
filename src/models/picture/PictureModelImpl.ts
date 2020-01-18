import {PictureModel} from "./PictureModel";
import {Db, ObjectId} from "mongodb";
import {Picture} from "./Picture";
import {User} from "../auth/User";
import * as fs from "fs";
import * as path from "path";
import {Request} from "express";

export class PictureModelImpl implements PictureModel {


    private db: Db;

    constructor(db: Db) {
        this.db = db;
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
            createdAt: Date.now(),
            path: "/pictures/" + user.username + '/' + file.originalname,
            size: file.size
        };
        const result = await this.db.collection('pictures').insertOne({userId: user._id, picture: picture});
        return result.insertedId;
    }

    moveFileToFolder(file: Request['file'], user: User): void {
        if (!user) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        this.movePictureToUsersFolder(user, file);
    }

    /**
     * Déplace l'image se trouvant dans public/pictures
     * vers public/pictures/username
     *
     * Lance une erreur si le chemin currentPath est faux / inexistant
     * Lance une erreur si le chemin destPath est faux / inexistant
     *
     * @param user Correspond à l'utilisateur qui a "uploadé" la photo
     * @param file Est le fichier correspondant
     */
    private movePictureToUsersFolder(user: User, file: any): void {

        const currentPath = path.join('./public/pictures/', file.originalname);
        const destPath = path.join('./public/pictures/', user.username, file.originalname);

        fs.rename(currentPath, destPath, (err) => {
            if (err) throw Error(err.message + "déplacement de fichier impossible");
        });
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
            await this.deleteFileFromFolder(picturesInformation, user);
        } catch (errors) {
            throw errors;
        }
    }

    /**
     * Supprime les informations d'une photo contenu dans la base de donnée
     * @param pictureId
     *
     * @return un objet du type { _id : ObjectId ,userId : ObjectId , picture : Picture}
     */
    private async deleteFileFromDB(pictureId: ObjectId): Promise<any> {
        return (await this.db.collection('pictures').findOneAndDelete({_id: pictureId})).value
    }

    /**
     * Supprime la photo du dossier utilisateur
     * @param pictureInformations un object contenant les informations d'une photo à supprimer
     *
     * @param user
     */
    private async deleteFileFromFolder(pictureInformations: any, user: User): Promise<void> {
        if (!pictureInformations.picture || !pictureInformations.userId || !pictureInformations._id) throw Error("Impossible de supprimer une image d'un dossier");

        const pictures: any[] = await this.db.collection('pictures').find({userId: new ObjectId(user._id)}).toArray();

        let existInDB = 0;
        for (let picture of pictures) {
            if (picture.picture.name == pictureInformations.picture.name) {
                existInDB = 1;
                break;
            }
        }

        if (existInDB == 0) {
            fs.unlink('./public/pictures/' + user.username + "/" + pictureInformations.picture.name, (err) => {
                if (err) throw err
            })
        }
    }


}