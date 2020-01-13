import {PictureModel} from "./PictureModel";
import {Db, ObjectId} from "mongodb";
import {Picture} from "./Picture";
import {User} from "../auth/User";
import * as fs from "fs";
import * as path from "path"
import {Request} from "express";

export class PictureModelImpl implements PictureModel {


    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     *@see PictureModel/uploadFile
     * @deprecated
     */
    async uploadFile(file: Request['file'], user: User): Promise<void> {

        if (!user) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        this.movePictureToUsersFolder(user, file);

        const picture: Picture = {
            name: file.originalname,
            createdAt: Date.now(),
            path: "/pictures/" + user.username + '/' + file.originalname,
            size: file.size
        };
        await this.db.collection('pictures').insertOne({userId: user._id, picture: picture});
    }

    moveFileToFolder(file: Request['file'], user: User): void {
        if (!user) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        this.movePictureToUsersFolder(user, file);
    }

    async uploadFileToDB(file: Request['file'], user: User): Promise<void> {

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

    /**
     *@see PictureModel/findUsersPictures
     */
    async findUsersPictures(userId: any): Promise<any[]> {
        if (userId == undefined) throw Error("Impossible de récupérer les photos vous n'êtes pas connecté");

        return await this.db.collection('pictures').find({userId: userId}).toArray();
    }

    /**
     * Supprime une photo de la base de donnée
     * et du dossier utilisateur
     *@deprecated
     * @param pictureId
     */
    async supprimer(pictureId: any): Promise<void> {
        const picture: any | null = await this.db.collection('pictures').findOneAndDelete({_id: new ObjectId(pictureId)});

        if (!picture.value) throw Error("La photo n'existe pas");
        const userId = picture.value.userId;
        const user: User | null = await this.db.collection('users').findOne({_id: userId});
        if (!user) throw Error("l'utilisateur n'exista pas");


        fs.unlink('./public/pictures/' + user.username + "/" + picture.value.picture.name, (err) => {
            if (err) throw err
        })
    }

    /**
     *
     * @param pictureId
     * @param userId
     *
     * @return un objet du type { lastErrorObject : {} , value :{} , ok : {}}
     */
    async deleteFileFromDB(pictureId: any, userId: any): Promise<any> {
        return (await (this.db.collection('pictures').findOneAndDelete({_id: new ObjectId(pictureId)}))).value;
    }

    async deleteFileFromFolder(pictureInformations: any, user: User): Promise<void> {
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
}