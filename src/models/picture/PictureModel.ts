export interface PictureModel {

    /**
     * Cette méthode ajoute un fichier dans le dossier
     * public/pictures
     * Il ajoute un à la base de donnée les informations
     * @file.name @file.path @file.size et @createdAt
     * et lie ces informations à l'utisateur qui l'a "uploadé"
     *
     *
     * lance une exception si l'utilisateur n'est pas connecté
     * lance une exception si le fichier est indéfini
     *
     */
    uploadFile(file : any,userID : any) : Promise<void> ;


    /**
     * Cette méthode affiche les images "uploadé"
     * par l'utilisateur portant le numéro userID
     *
     *
     * @param userId
     */
    showPictures(userId : any) : Promise<string[]>;
}