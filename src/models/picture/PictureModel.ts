import {User} from "../auth/User";
import {Request} from "express";

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
     * @deprecated
     */
    uploadFile(file: Request['file'], user: User): Promise<void>;

    /**
     * Extrait les données de file et créer une Picture
     * et fini par le stocker dans la base de donnée
     *
     * Lance une erreur si une personne non connecté tente d'envoyer une image
     * Lance une erreur si le fichier est indéfini
     *
     * @param file
     * @param user
     * @return une promesse d'avoir le numéro d'insertion de la Picture
     */
    uploadFileToDB(file: Request['file'], user: User): Promise<void>


    /**
     * Déplace le fichier file dans le dossier
     * de l'utilisateur correspondant
     *
     * Lance une erreur si une personne non connecté tente d'envoyer une image
     * Lance une erreur si le fichier est indéfini
     * @param file
     * @param user
     */
    moveFileToFolder(file: Request['file'], user: User): void

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
    findUsersPictures(user: User): Promise<any[]>;


    /**
     * Supprime une image sélectionnée
     */
    supprimer(id : any) : Promise<void>;
}