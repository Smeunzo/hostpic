import { User } from "./User";

export interface AuthModel {

    /**
     * It registers the user in the database with datas
     * given in parameters.
     *
     * @throws Error if the username the password
     * do not respect length constraint
     * @throws Error if username is already used.
     *
     * @param data
     * @return a promise to get the user's insertedId (which is the userId)
     */
    signUp(data : any) : Promise<any>;

    /**
     * Process the connection of the user.
     * It returns user id from data passed to parameter.
     *
     * @throws Error if the username the password
     * do not respect length constraint
     * @throws Error if username is already used.
     *
     * @param data an object which contains the username and password
     * @return a promise to get the userId.
     */
    getUserId(data : any) : Promise<any>;

    /**
     * It returns user's information from the id passed
     * in parameters.
     *
     * @throws Error if username is invalid or doesn't exist.
     *
     * @param id the user id
     * @return a promise to get an object which represents User.
     */
    getUserFromId(id : any) : Promise<User>;
}