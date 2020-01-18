import {ObjectId} from "mongodb";

export interface AdminModel {

    /**
     * Retourne la liste de tous les utilisateurs
     */
    getUsers() : Promise<any[]>;

    /**
     * Supprime le compte d'un utilisateur de la base de donnée
     * et supprime son dossier image
     * @param userId
     */
    deleteUser(userId : ObjectId): Promise<void>;


}