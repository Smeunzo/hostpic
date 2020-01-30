import {User} from "../auth/User";
import {Request} from "express";
import { ObjectId } from "mongodb";

export interface PictureModel {


    /**
     * It just launches uploadPicturesInformationsToDb and moveFileToFolder
     */
    newPictureAdded(file: Request['file'], user : User): Promise<void>;

    /**
     * Extract name and size from the file , create the path with the name and username,
     * store the Picture (the class, not the real picture) in the database.
     *
     * @throws Error if non-connected user try to send a Picture
     * @throws Error if the file is undefined.
     *
     * @param file
     * @param user
     * @return Promise of get the insertedId of the picture.
     */
    uploadPicturesInformationsToDb(file: Request['file'], user: User): Promise<ObjectId>


    /**
     * @context Because I use multer for uploading file
     * I have to set the upload storage at the same place
     * where the router is, and it's in the AlbumController class
     *
     * Move the file to the corresponding user's folder
     *
     * @throws Error if non-connected user try to send a Picture
     * @throws Error if the file is undefined.
     *
     * @param file
     * @param user
     */
    moveFileToFolder(file: Request['file'], user: User): void

    /**
     * Return an array of Picture for a specific user
     *
     * @param user
     * @throws Error if non-connected user try to send a Picture
     * @return a promise to get an array of all user's pictures.
     */
    findUsersPictures(user: User): Promise<any[]>;

    /**
     * Process the deletion of a file by removing it from the
     * database and removing it from the user's folder.
     *
     * @param pictureId
     * @param user
     */
    deleteFile(pictureId : ObjectId, user : User) : Promise<void>;

    /**
     * return the last picture uploaded by the user.
     *
     * @return a promise to get the last picture posted by the user.
     */
    findLastPicture(user : User) : Promise<any>;
}