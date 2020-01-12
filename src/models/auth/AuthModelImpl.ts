import {User} from "./User";
import {Db, ObjectId} from "mongodb";
import * as bcrypt from "bcrypt";
import {validate} from "class-validator";
import {LogInData} from "./LogInData";
import {AuthModel} from "./AuthModel";
import {plainToClass} from "class-transformer";
import * as fs from "fs";

export class AuthModelImpl implements AuthModel {
    private db : Db;

    /**
     * Construit un modèle asynchrone.
     *
     * @param db Base de données.
     */
    constructor(db : Db) {
        this.db = db;
    }

    /**
     * @see AuthModel#signUp
     */
    async signUp(data: any): Promise<any> {
        const logInData : LogInData = plainToClass(LogInData, data, {strategy : 'excludeAll' });
        await this.validate(logInData);

        const userNameAlreadyExists = await this.db.collection('users').findOne({username : logInData.username});
        if(userNameAlreadyExists != null) throw new Error("Username already exists");
        const hashedPassword = await bcrypt.hash(logInData.password,10);
        const signUpId = await this.db.collection('users').insertOne({
            username : logInData.username,
            password : hashedPassword
        });

        this.createUsersPicturesDirectory(logInData.username);
        return signUpId.insertedId;
    }

    /**
     * @see AuthModel#getUserId
     */
    async getUserId(data: any): Promise<any> {
        const logInData : LogInData = plainToClass(LogInData, data, {strategy : 'excludeAll' });
        await this.validate(logInData);
        const userInformations = await this.db.collection('users').findOne({username : logInData.username});
        if(userInformations == null ) {
            throw new Error("Username or password are not correct")
        }

        const isPasswordCorrect = await bcrypt.compare(logInData.password,userInformations.password);
        if(!isPasswordCorrect){
            throw new Error("Username or password are not correct")
        }


        return userInformations._id;
    }

    /**
     * @see AuthModel#getUserFromId
     */
    async getUserFromId(id : any) : Promise<User> {

        const userInformations = await this.db.collection('users').findOne({_id:new ObjectId(id)});
        if(userInformations == null) throw new Error("User not found");
        userInformations.password = "";

        return {
            _id: userInformations._id,
            username: userInformations.username
        }
    }

    /**
     *
     * Lève une exception si l'objet passé en paramètre n'a pas pu être validé.
     *
     * @param object Objet à valider
     */
    private async validate(object : any) : Promise<void> {
        const errors = await validate(object);
        if (errors.length == 0) return;
        throw errors;
    }

    /**
     *Créer le dossier où sera contenu toutes les images
     * de l'utilisateur
     *
     * @param username
     */
    private createUsersPicturesDirectory(username : string) {
        if(!fs.existsSync('./public/pictures/'+username)){
            fs.mkdir('./public/pictures/' + username , (err) => {
                if (err) {
                    throw Error(err.message+" Impossible de créer le sous-dossier");
                }
            })
        }
    }
}