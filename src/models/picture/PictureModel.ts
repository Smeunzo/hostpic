import {User} from "../auth/User";

export interface PictureModel {


    /**
     * Extrait les données de file et créer une Picture
     * et fini par le stocker dans la base de donnée
     *
     * Déplace le fichier @see movePictureToUsersFolder
     *
     * Lance une erreur si une personne non connecté tente d'envoyer une image
     * Lance une erreur si le fichier est indéfini
     * @param file Le fichier correspondant
     * @param user l'utilisateur qui a "uploadé" le fichier
     */
    uploadFile(file: any, user: User): Promise<void>;


    /**
     * Renvoie les liens de toutes les images que l'utilisateur
     * a "uploadé"
     *
     * @param user l'utilisateur qui veut récupérer les
     * photos
     *
     * @return une promesse d'avoir un tableau contenant
     * tous les liens vers les photos que l'utilisateur
     * a "uploadé"
     */
    findUsersPictures(user: User): Promise<string[]>;
}