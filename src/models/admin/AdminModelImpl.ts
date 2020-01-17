import {AdminModel} from "./AdminModel";
import {Db, ObjectId} from "mongodb";
import {User} from "../auth/User";
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
        return deletedUser;
    }

    async deleteUsersFolder(deletedUser: any): Promise<void> {
        assert(deletedUser != undefined, "L'utilisateur n'a pas été correctement supprimé de la base de donnée");
        const pathToDir  = path.join('./public/pictures/',deletedUser.username);

        const dir = await fs.promises.opendir(pathToDir);
        for await (const dirent of dir) {
            const pathToFile = pathToDir.toString()+'/'+dirent.name;
            fs.unlink(pathToFile, (err) => {
                if(err) throw err;
            });
        }
        await dir.close();

        const dirLength = (await fs.promises.readdir(pathToDir)).length;
        console.log(dirLength);
        assert(dirLength == 0);

        fs.rmdirSync(pathToDir,);
    }

}