import {expect} from "chai";
import {PictureModelImpl} from "../../../src/models/picture/PictureModelImpl";
import {Db, MongoClient, ObjectID, ObjectId} from "mongodb";
import {Request} from "express";
import {User} from "../../../src/models/auth/User";
import * as fs from "fs";
import * as path from "path";
import {Utils} from "../../../src/utils/Utils";

describe('PictureModelImpl', () => {

    let pictureModel: PictureModelImpl;
    let mongoClient: MongoClient;
    let db: Db;

    const fakeUser: User = {_id: new ObjectID(), username: "testAjoutFichier"};
    const fakeFile: Request["file"] = {
        fieldname: "image",
        originalname: "image.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 9000,
        destination: Utils.__pathToStorage,
        filename: "image.png",
        path: Utils.__pathToStorage+"/image.png",
        buffer: Buffer.from(new ArrayBuffer(0), 0, 0),
        location: ""
    };

    function createFile() {
        const pathToFile = path.join(Utils.__pathToStorage,'/', "image.png");
        fs.open(pathToFile, 'as', (err, fd) => {
            if (err) throw err;
            else fs.close(fd, (err) => {
                if (err) throw  err
            })
        });
    }

    function deleteFile() {
        const pathToFile = path.join(Utils.__pathToStorage,'/', fakeUser.username, "image.png");
        fs.unlink(pathToFile, (err) => {
            if (err) throw err;
        })
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    before(async () => {
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true});
        db = mongoClient.db('test');
        pictureModel = new PictureModelImpl(db);
    });


    describe('#deleteFile', async () => {
        it("should delete picture information from the DB", async () => {
            try{
                await createFile();
                pictureModel.moveFileToFolder(fakeFile,fakeUser);
                const pictureId : ObjectId = await pictureModel.uploadPicturesInformationsToDb(fakeFile, fakeUser);
                await pictureModel.deleteFile(pictureId,fakeUser);
                expect(db.collection('pictures').findOne({_id : pictureId})).to.be.empty
            }catch (errors) {
                console.log(errors.message);
            }

        });

        it("should delete a picture from user's folder", async () =>{
            const pathToFile = path.join( Utils.__pathToStorage ,fakeUser.username,fakeFile.originalname);
            try{
                await createFile();
                pictureModel.moveFileToFolder(fakeFile,fakeUser);
                await sleep(300);
                const pictureId : ObjectId = await pictureModel.uploadPicturesInformationsToDb(fakeFile, fakeUser);
                expect(fs.existsSync(Utils.__pathToStorage+'/'+fakeUser.username+'/'+fakeFile.originalname),"Le fichier n'existe pas").to.be.true;
                await pictureModel.deleteFile(pictureId,fakeUser);
                await sleep(500);
                expect(fs.existsSync(pathToFile),"Le fichier n'a pas pu être supprimé car il existe d'autres exemplaires disponibles dans la base de donnée").to.be.false;
            }catch (errors) {
                throw errors;
            }
        })
    });

    describe('#uploadFile', async () => {
        let emptyFile: Request['file'];
        let emptyUser: User;


        it("should throw \"Une erreur avec le fichier\"", async () => {
            try {
                await pictureModel.uploadPicturesInformationsToDb(emptyFile, fakeUser);
            } catch (errors) {
                expect(errors.message).to.be.equals("Envoie du fichier impossible, il y a une erreur avec le fichier");
                return;
            }
            expect.fail()
        });


        it("should throw \"l'utilisateur n'est pas connecté\" ", async () => {
            try {
                await pictureModel.uploadPicturesInformationsToDb(fakeFile, emptyUser);
            } catch (errors) {
                expect(errors.message).to.be.equals('Envoie du fichier impossible, l\'utilisateur n\'est pas connecté');
                return;
            }
            expect.fail();
        });

        it('should add a picture into DB for specified user', async () => {
            try {
                await pictureModel.uploadPicturesInformationsToDb(fakeFile, fakeUser);
                const picture = await db.collection('pictures').findOne({
                    userId: fakeUser._id
                });
                expect(picture).to.not.be.null;
                expect(picture.picture.size).to.be.equals(fakeFile.size);
                expect(picture.picture.path).to.be.equals('/pictures/' +
                    fakeUser.username + '/' + fakeFile.originalname);
            } catch (errors) {
                console.log(errors.message)
            }
        });

        it("should move picture to the user's folder ", async () => {
            createFile();
            await sleep(300);
            const oldPath = path.join(Utils.__pathToStorage,fakeFile.originalname);
            const newPath = path.join(Utils.__pathToStorage , fakeUser.username , "/" , fakeFile.originalname);
            try {
                expect(fs.existsSync(oldPath)).to.be.true;
                pictureModel.moveFileToFolder(fakeFile, fakeUser);
                await sleep(500);
                expect(fs.existsSync(newPath)).to.be.true;


            } catch (e) {
                throw e;
            }

            deleteFile();
        });


    });


    //Doit nécessairement avoir un dossier pour l'uilisateur test créer au préalable
    // car la méthode createUsersPictureDirectory est privée
    describe('#findUsersPictures', async () => {

        it('should return an array of all images paths', async () => {
            await createAndMoveFile();
            await createAndMoveFile();
            await createAndMoveFile();

            const paths: any[] = await pictureModel.findUsersPictures(fakeUser._id);
            expect(paths[0].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[1].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[2].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            deleteFile();
        });

        async function createAndMoveFile() {
            createFile();
            await sleep(300);
            await pictureModel.uploadPicturesInformationsToDb(fakeFile, fakeUser);
            pictureModel.moveFileToFolder(fakeFile, fakeUser);
        }
    });





    afterEach(async () => {
        await db.dropDatabase();
    });


    after(async () => {
        await mongoClient.close()
    });
});