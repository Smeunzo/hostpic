const fs = require("fs");


async function createAllFolders(){
    if(!fs.existsSync('./upload')){
        await createFolder('./upload');
    }
    if(!fs.existsSync('./upload/pictures')){
        await createFolder('./upload/pictures');
    }
    //Pour les tests
    if(!fs.existsSync('./upload/pictures/testAjoutFichier')){
        await createFolder('./upload/pictures/testAjoutFichier');
    }
}


async function createFolder(path){
    try{
        await fs.promises.mkdir(path, (err) => {
            if(err) throw err;
        })
    }catch (err) {
        throw err;
    }
}

createAllFolders().then();