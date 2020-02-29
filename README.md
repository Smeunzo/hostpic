# hostpic
A website for pictures hosting, and more.

## TL;DR

If you don't want to install all the project take a look here I'll describe what I've learned, which stack I've used etc...

Stack used 
    
    BackEnd : ExpressJs And MongoDB
    FrontEnd : PugJS, Bootstrap,jQuery
    
The whole BackEnd is write in TypeScript and the FrontEnd is PugJs (ex Jade) template

So what I've learned ? (this is not an exhaustive list I assume I've learned more than that)
* Structure a website by using MVC design
* Manage a database with MongoDB
* Manage a server with ExpressJs
* Async / Await and Promises and the difference between a thread(e.g. Java) and a promise
* Security but briefly I don't use helmet and other stuff for now 
* How cookies and sessions work
* Upload with multerJS
* Errors Handling
* AJAX Request
* (TypeScript, JavaScript,npm ,NodeJs, Git and GitHub) obviously 
* Etc ...
  
    
#### This section is in French it'll be translated soon as possible !:)    
  

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




### 5.

```
//dans un terminal à la racine 
//se charge de créer les dossiers
npm run cf
```

#### quelques screenshots

##### login
![alt text](readme_images/login.png "se connecter ou s'inscrire")

##### upload 
![alt text](readme_images/upload.png "uploader une image ")

##### mes photos
![alt text](readme_images/mes_photos.png "l'ensemble des photos postées")

##### administration
![alt text](readme_images/administration.png "supprimer un utilisateur") 