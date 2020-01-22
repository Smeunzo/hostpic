# website_hostpic
Un Site web d'hébergement photo


### 1.installer les dépendences
```
npm install // à la racine du projet 
```

### 2. Télécharger un server [mongoDB](https://www.mongodb.com/download-center/community) 
    version 4.0.14 
    OS Linux 64-bit legacy x64
    package TGZ
    
### 3.
    À la racine du projet créer un dossier /mongoDB et /mongoDB/data
    décompresser le server dans le dossier /mongoDB
    
### 4.
    npm build //construire le projet
    //déplacez vous dans le dossier /mongoDB/[LE_NOM_DU_SEREVR]/bin
    ./mongod --dbpath="[CHEMIN_VERS_LE_PROJET]/mongoDB/data" //laisser tourner
    
    //dans un terminal séparé
    npm start
