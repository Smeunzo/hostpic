import {AdminModel} from "./AdminModel";
import {Db, ObjectId} from "mongodb";
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path"

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

    async deleteUserFromDb(userId: any): Promise<any> {
        assert(userId != undefined, "Nom d'utilisateur indéfini");
        const deletedUser = await this.db.collection('users').findOneAndDelete({_id: new ObjectId(userId)});
        if (deletedUser.value == null) throw Error("Impossible de supprimer cet utilisateur");
        return deletedUser.value;
    }

    async deleteUsersFolder(deletedUser: any): Promise<void> {
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