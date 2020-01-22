# hostpic
Un Site web d'hébergement photo


### 1.installer les dépendances
```
npm install // à la racine du projet 
```

### 2. Télécharger un serveur [mongoDB](https://www.mongodb.com/download-center/community) 
    version 4.0.14 
    OS Linux 64-bit legacy x64
    package TGZ
    
### 3.
    À la racine du projet créer un dossier /mongoDB et /mongoDB/data
    décompresser le server dans le dossier /mongoDB
    
### 4.
    npm build //construire le projet
    //déplacez vous dans le dossier "/mongoDB/[LE_NOM_DU_SERVEUR]/bin"
    ./mongod --dbpath="[CHEMIN_VERS_LE_PROJET]/mongoDB/data" //laisser tourner
    
    //dans un terminal séparé à la racine 
    npm start

Vous aurez besoin de créer en plus certains dossiers (en attendant que je fasse les méthodes qui les créer automatiquement)
* /upload à la racine 
* /upload/pictures
* /upload/pictures/testAjoutFichier (pour faire passer les tests)

#### quelques screenshots
    ![alt text](https://github.com/Smeunzo/hostpic/blob/master/readme_images/administration.png "administration") 