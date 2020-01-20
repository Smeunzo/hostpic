import {AdminModel} from "./AdminModel";
import {Db, ObjectId} from "mongodb";
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path"
import {User} from "../auth/User";
import {Utils} from "../../utils/Utils";

export class AdminModelImpl implements AdminModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getUsers(): Promise<any[]> {
        const users = await this.db.collection('users').find().toArray();
        for (let i = 0; i < users.length; i++) {
            users[i].password = '';
        }
        return users;
    }

    /**
     *
     * @param userId
     */
    async deleteUser(userId : ObjectId): Promise<void>{
        const user : User = await this.deleteUserFromDb(userId);
        await this.deleteUsersPicturesAndFolder(user);
    }

    /**
     * supprime un utilisateur de la base de donnée
     * @param userId
     */
    private async deleteUserFromDb(userId: ObjectId): Promise<User> {
        assert(userId != undefined, "Nom d'utilisateur indéfini");

        const deletedUser = await this.db.collection('users').findOneAndDelete({_id: new ObjectId(userId)});
        await this.db.collection('pictures').deleteMany({userId : new ObjectId(userId)});

        if (deletedUser.value == null) throw Error("Impossible de supprimer cet utilisateur");
        return {_id: deletedUser.value._id, username: deletedUser.value.username};
    }

    // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    /**
     * supprime le dossier photo (et toutes les photos) d'un utilisateur
     * précédemment supprimé
     * @param deletedUser l'utilisateur supprimé par la méthode AdminModelImpl/deleteUserFormDb
     * @deprecated
     * NOT USED
     */
    private async deleteUsersFolder(deletedUser: User): Promise<void> {
        assert(deletedUser != undefined, "L'utilisateur n'a pas été correctement supprimé de la base de donnée");
        const pathToDir  = path.join('./public/pictures/',deletedUser.username);

        if(!fs.existsSync(pathToDir)) throw Error("Le dossier n'existe pas ");

        const dirEntries = await fs.promises.readdir(pathToDir);

        for(let i = 0 ; i < dirEntries.length ; i++){
            await fs.promises.unlink(pathToDir+'/'+dirEntries[i]);
        }

        await fs.promises.rmdir(pathToDir);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * replica de deleteUserFolder
     * @param deletedUser
     */
    private async deleteUsersPicturesAndFolder(deletedUser : User): Promise<void>{
        assert(deletedUser != undefined, "L'utilisateur n'a pas été correctement supprimé de la base de donnée");
        const pathToUsersDir = path.join(Utils.__pathToStorage,'/',deletedUser.username);

        if(!fs.existsSync(pathToUsersDir)) throw Error("Le dossier n'existe pas");

        const dirEntry = await fs.promises.readdir(pathToUsersDir);

        for(let i = 0 ; i< dirEntry.length; i++){
            await fs.promises.unlink(pathToUsersDir+'/'+dirEntry[i]);
        }

        await fs.promises.rmdir(pathToUsersDir);
    }
}