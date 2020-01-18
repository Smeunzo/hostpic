import {AdminModel} from "./AdminModel";
import {Db, ObjectId} from "mongodb";
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path"
import {User} from "../auth/User";

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
        await this.deleteUsersFolder(user);
    }

    /**
     * supprime un utilisateur de la base de donnée
     * @param userId
     */
    private async deleteUserFromDb(userId: ObjectId): Promise<User> {
        assert(userId != undefined, "Nom d'utilisateur indéfini");
        const deletedUser = await this.db.collection('users').findOneAndDelete({_id: userId});
        if (deletedUser.value == null) throw Error("Impossible de supprimer cet utilisateur");
        return {_id: deletedUser.value._id, username: deletedUser.value.username};
    }

    // noinspection JSMethodCanBeStatic
    /**
     * supprime le dossier photo (et toutes les photos) d'un utilisateur
     * précédemment supprimé
     * @param deletedUser l'utilisateur supprimé par la méthode AdminModelImpl/deleteUserFormDb
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

}