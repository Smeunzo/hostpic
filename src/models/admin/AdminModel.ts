import {ObjectId} from "mongodb";

export interface AdminModel {

    /**
     * Returns an array of all Users
     *
     * @return a promise to get an array of all Users
     */
    getUsers() : Promise<any[]>;

    /**
     * Removes a user's account from the database and removes his
     * picture folder.
     *
     * @param userId
     */
    deleteUser(userId : ObjectId): Promise<void>;

}