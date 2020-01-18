import {User} from "../auth/User";
import {Request} from "express";
import { ObjectId } from "mongodb";

export interface PictureModel {



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
    uploadPicturesInformationsToDb(file: Request['file'], user: User): Promise<ObjectId>


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
     * 1.Supprime les informations d'une photo de la base de donnée
     * 2.Supprime la photo du dossier utilisateur
     * @param pictureId
     * @param user
     */
    deleteFile(pictureId : ObjectId, user : User) : Promise<void>;

}