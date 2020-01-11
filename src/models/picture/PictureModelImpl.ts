import {PictureModel} from "./PictureModel";
import {Db} from "mongodb";
import {Picture} from "./Picture";

export class PictureModelImpl implements PictureModel{


    private  db : Db ;
    constructor(db : Db) {
        this.db = db;
    }

    /**
     *
     * @param file
     * @param userId
     */
    async uploadFile(file : any,userId : any) : Promise<void> {
        console.log(file);

        if (!userId) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        const picture: Picture = {name: file.originalname, createdAt: Date.now(), path: file.path, size: file.size};
        await this.db.collection('pictures').insertOne({userId: userId, picture: picture});
    }
    //TODO tourver un meilleur nommage gérér les erreurs
    async showPictures(userId: any): Promise<string[]> {
        return await this.db.collection('pictures').find({userId: userId}).toArray();
    }
}