import {User} from "../auth/User";

export interface AdminModel {

    /**
     * Retourne la liste de tous les utilisateurs
     */
    getUsers() : Promise<User[]>;


    /**
     * supprime un utilisateur de la base de donnée
     * @param userId
     */
    deleteUserFromDb(userId : any) : Promise<any>;


    /**
     * supprime le dossier photo (et toutes les photos) d'un utilisateur
     * précédemment supprimé
     * @param deletedUser
     */
    deleteUsersFolder(deletedUser : any) : Promise<void>;


}