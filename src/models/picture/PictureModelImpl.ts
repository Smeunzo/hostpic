import {PictureModel} from "./PictureModel";
import {Db} from "mongodb";
import {Picture} from "./Picture";
import {User} from "../auth/User";
import * as fs from "fs";
import  * as path from "path"

export class PictureModelImpl implements PictureModel{


    private  db : Db ;
    constructor(db : Db) {
        this.db = db;
    }

    /**
     *
     * @param file
     * @param user
     */
    async uploadFile(file : any,user : User) : Promise<void> {

        if (!user) throw Error("L'utilisateur n'est pas connecté");
        if (!file) throw Error("Une erreur avec le fichier");
        this.movePictureToUsersFolder(user,file);

        const picture: Picture = {
            name: file.originalname,
            createdAt: Date.now(),
            path: "/pictures/"+user.username+'/'+file.originalname ,
            size: file.size};
        await this.db.collection('pictures').insertOne({userId: user._id, picture: picture});
    }

    async findUsersPictures(user: User): Promise<string[]> {
        if(user == undefined) throw Error("Impossible de récupérer les photos vous n'êtes pas connecté");

        return await this.db.collection('pictures').find({userId: user._id}).toArray();
    }




    private movePictureToUsersFolder(user : User, file : any) : void{

        const currentPath =  path.join('./public/pictures/',file.originalname);
        const destPath = path.join('./public/pictures/',user.username,file.originalname);

        fs.rename(currentPath,destPath,(err) =>{
            if(err) throw Error(err.message + "déplacement de fichier impossible");
        });
    }
}