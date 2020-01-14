import {User} from "../auth/User";

export interface AdminModel {

    /**
     * Retourne la liste de tous les utilisateurs
     */
    getUsers() : Promise<User[]>;

}