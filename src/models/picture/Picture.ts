export interface Picture {
    /**
     * Le nom du fichier
     */
    name : string

    /**
     * chemin vers le fichier
     */
    path : string

    /**
     * La taille en bytes de l'image
     */
    size : any

    /**
     * date de création
     */
    createdAt : Date;
}