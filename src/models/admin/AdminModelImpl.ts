import {AdminModel} from "./AdminModel";
import {Db} from "mongodb";
import {User} from "../auth/User";

export class AdminModelImpl implements AdminModel{
    private db: Db;

    constructor(db : Db) {
        this.db = db;
    }

    async getUsers(): Promise<any[]> {
        const  users   = await  this.db.collection('users').find().toArray();
        for(let i = 0 ; i < users.length ; i++){
            users[i].password = '';
        }
        return users;
    }

}