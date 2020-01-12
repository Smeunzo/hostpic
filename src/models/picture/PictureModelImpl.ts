import {PictureModel} from "./PictureModel";
import {Db} from "mongodb";
import {Picture} from "./Picture";
import {User} from "../auth/User";

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

    async findUsersPictures(userId: any): Promise<string[]> {
        if(userId == undefined) throw Error("Impossible de récupérer les photos vous n'êtes pas connecté");

        const user : User | null = await this.db.collection('users').findOne({_id : userId});
        if(user == null) throw Error("Impossible de récupérer les photos de cet utilisateur car il n'exite pas");
        return await this.db.collection('pictures').find({userId: userId}).toArray();
    }
}