import {AuthModel} from "./AuthModel";
import {Db, ObjectID} from "mongodb";
import {User} from "./User";
import {validate} from "class-validator";
import {plainToClass} from "class-transformer";
import {LogInData} from "./LogInData";
import * as bcrypt from "bcrypt";

export class AuthModelImpl implements AuthModel{

    private db : Db;

    constructor(db : Db) {
        this.db = db;
    }

    /**
     * @see AuthModel/getUserFromId
     * @param id
     */
    async getUserFromId(id: any): Promise<User> {
        const user : User | null = await this.db.collection('users').findOne({User: {_id : new ObjectID(id)}});

        if( user == null){
            throw new Error("User not Found");
        }

        user.password = '';
        return user;
    }

    /**
     * @see AuthModel/getUserId
     * @param data
     */
    async getUserId(data: any): Promise<any> {
       const logInData : LogInData = plainToClass(LogInData, data,{strategy : "excludeAll"});
       await this.validate(data);

       const user : User | null = await this.db.collection('users').findOne({User : {username : logInData.username}});
       if(user == null){
           throw new Error("Nom d'utilisateur inconnu");
       }

       const ok = await bcrypt.compare(logInData.password,user.password);
       if(!ok){
           throw new Error("Mot de passe incorrect")
       }

       return user._id;

    }


    /**
     * @see AuthModel/signUp
     * @param data
     */
    async signUp(data: any): Promise<any> {
        const logInData : LogInData = plainToClass(LogInData ,data, {strategy :"excludeAll"});
        await this.validate(logInData);

        if(await this.db.collection('users').findOne({User : {username : logInData.username}})){
            throw new Error("Nom d'utilisateur déjà pris")
        }
        await bcrypt.hash(logInData.password, 13);

        const newUser : User = {_id : new ObjectID(),username : logInData.username, password : logInData.password};

        this.db.collection('users').insertOne(newUser);
        return newUser._id;
    }

    private async validate(object : any) : Promise<void> {
        const errors = await validate(object);
        if (errors.length == 0) return;
        throw errors;
    }
}