import {User} from "./User";
import {Db, ObjectId} from "mongodb";
import * as bcrypt from "bcrypt";
import {validate} from "class-validator";
import {LogInData} from "./LogInData";
import {AuthModel} from "./AuthModel";
import {plainToClass} from "class-transformer";
import * as fs from "fs";
import {Utils} from "../../utils/Utils";
import * as path from "path";

export class AuthModelImpl implements AuthModel {

    /**
     * @var db the database
     */
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * @see AuthModel#signUp
     */
    async signUp(data: any): Promise<any> {
        const logInData: LogInData = plainToClass(LogInData, data, {strategy: 'excludeAll'});
        await this.validate(logInData);

        const userNameAlreadyExists = await this.db.collection('users').findOne({username: logInData.username});
        if (userNameAlreadyExists != null) throw new Error("Username already exists");
        const hashedPassword = await bcrypt.hash(logInData.password, 10);
        const signUpId = await this.db.collection('users').insertOne({
            username: logInData.username,
            password: hashedPassword
        });

        this.createUsersDirectory(logInData.username);
        return signUpId.insertedId;
    }

    /**
     * @see AuthModel#getUserId
     */
    async getUserId(data: any): Promise<any> {
        const logInData: LogInData = plainToClass(LogInData, data, {strategy: 'excludeAll'});
        await this.validate(logInData);
        const userInformations = await this.db.collection('users').findOne({username: logInData.username});
        if (userInformations == null) {
            throw new Error("Username or password are not correct")
        }

        const isPasswordCorrect = await bcrypt.compare(logInData.password, userInformations.password);
        if (!isPasswordCorrect) {
            throw new Error("Username or password are not correct")
        }


        return userInformations._id;
    }

    /**
     * @see AuthModel#getUserFromId
     */
    async getUserFromId(id: any): Promise<User> {

        const userInformations = await this.db.collection('users').findOne({_id: new ObjectId(id)});
        if (userInformations == null) throw new Error("User not found");
        userInformations.password = "";

        return {
            _id: userInformations._id,
            username: userInformations.username
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * @throws Error if object is invalid
     *
     * @param object Objet à valider
     */
    private async validate(object: any): Promise<void> {
        const errors = await validate(object);
        if (errors.length == 0) return;
        throw errors;
    }


    /**
     * Creates the user's folder where them pictures will be stored.
     *
     * @throws Error if it's impossible to create user's folder.
     * @param username
     */
    private createUsersDirectory(username: string) {
        const pathToDir = path.join(Utils.__pathToStorage, username);
        if (!fs.existsSync(pathToDir)) {
            fs.mkdir(pathToDir, (err) => {
                if (err) {
                    throw Error(err.message + " Impossible de créer le sous-dossier");
                }
            })
        }
    }
}