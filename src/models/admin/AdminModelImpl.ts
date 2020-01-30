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

    /**
     * @see AdminModel#getUsers
     */
    async getUsers(): Promise<any[]> {
        const users = await this.db.collection('users').find().toArray();
        for (let i = 0; i < users.length; i++) {
            users[i].password = '';
        }
        return users;
    }

    /**
     * @see AdminModel#deleteUser
     */
    async deleteUser(userId : ObjectId): Promise<void>{
        const user : User = await this.deleteUserFromDb(userId);
        await this.deleteUsersPicturesAndFolder(user);
    }

    /**
     * Removes the user of the database.
     * @param userId
     */
    private async deleteUserFromDb(userId: ObjectId): Promise<User> {
        assert(userId != undefined, "Undefined username");

        const deletedUser = await this.db.collection('users').findOneAndDelete({_id: new ObjectId(userId)});
        await this.db.collection('pictures').deleteMany({userId : new ObjectId(userId)});

        if (deletedUser.value == null) throw Error("Cannot remove this user");
        return {_id: deletedUser.value._id, username: deletedUser.value.username};
    }


    // noinspection JSMethodCanBeStatic
    /**
     * Removes the user's folder and all pictures in it.
     *
     * @throws Error if the user hasn't been removed correctly.
     * @throws Error if the user's folder doesn't exist.
     *
     * @param deletedUser
     */
    private async deleteUsersPicturesAndFolder(deletedUser : User): Promise<void>{
        assert(deletedUser != undefined, "User hasn't been correctly removed from the database");
        const pathToUsersDir = path.join(Utils.__pathToStorage,'/',deletedUser.username);

        if(!fs.existsSync(pathToUsersDir)) throw Error("User's folder doesn't exist");

        const dirEntry = await fs.promises.readdir(pathToUsersDir);

        for(let i = 0 ; i< dirEntry.length; i++){
            await fs.promises.unlink(pathToUsersDir+'/'+dirEntry[i]);
        }

        await fs.promises.rmdir(pathToUsersDir);
    }
}