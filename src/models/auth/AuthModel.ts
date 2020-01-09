import { User } from "./User";

export interface AuthModel {

    /**
     * Enregistre l'ulisateur dans la base de donnée
     * via les données passées en paramètre
     *
     * Lève une exception si les contraintes de taille
     * pour le mot de pass ou le nom d'utilisateur ne sont
     * pas respectées
     * ou si le nom d'utilisateur est déjà pris
     *
     * @param data correspond à logInData
     * @return une promesse d'avoir l'identifiant du nouvel
     * utilisateur
     */
    signUp(data : any) : Promise<any>;

    /** Récupère l'identifiant d'un utilisateur
     * à partir des informations passées en paramètres
     *
     * Lève une exception si les contraintes de taille
     * pour le mot de pass ou le nom d'utilisateur ne sont
     * pas respectées
     * ou si le nom d'utilisateur ou le mot de passe
     * sont incorrectes
     *
     * @param data (voir LogInData)
     * @return une promesse d'avoir l'identifiant de l'utilisateur
     */
    getUserId(data : any) : Promise<any>;

    /**
     * Récupère un objet contenant les informations
     * liées à un utilisateur à partir de son identifiant.
     *
     * une exception est levée si le nom d'utilisateur
     * n'est pas valide ou n'existe pas
     *
     *
     * @param id Identifiant de l'utilisateur
     * @return une promesse d'avoir un objet représentant un utilisateur
     */
    getUserFromId(id : any) : Promise<User>;
}