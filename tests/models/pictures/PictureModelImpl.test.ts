import {expect} from "chai";
import {PictureModelImpl} from "../../../src/models/picture/PictureModelImpl";
import {Db, MongoClient, ObjectID} from "mongodb";
import {Request} from "express";
import {User} from "../../../src/models/auth/User";
import * as fs from "fs";
import * as path from "path";

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
        destination: "./public/pictures",
        filename: "image.png",
        path: "/public/pictures/image.png",
        buffer: Buffer.from(new ArrayBuffer(0), 0, 0),
        location: ""
    };

    function createFile() {
        const pathToFile = path.join("./public/pictures/", "image.png");
        fs.open(pathToFile, 'as', (err, fd) => {
            if (err) throw err;
            else fs.close(fd, (err) => {
                if (err) throw  err
            })
        });
    }

    function deleteFile() {
        const pathToFile = path.join("./public/pictures/", fakeUser.username, "image.png");
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

    describe('#uploadFile', async () => {
        let emptyFile: Request['file'];
        let emptyUser: User;


        it("should throw \"Une erreur avec le fichier\"", async () => {
            try {
                await pictureModel.uploadFileToDB(emptyFile, fakeUser);
            } catch (errors) {
                expect(errors.message).to.be.equals("Envoie du fichier impossible, il y a une erreur avec le fichier");
                return;
            }
            expect.fail()
        });


        it("should throw \"l'utilisateur n'est pas connecté\" ", async () => {
            try {
                await pictureModel.uploadFileToDB(fakeFile, emptyUser);
            } catch (errors) {
                expect(errors.message).to.be.equals('Envoie du fichier impossible, l\'utilisateur n\'est pas connecté');
                return;
            }
            expect.fail();
        });

        it('should add a picture into DB for specified user', async () => {
            try {
                await pictureModel.uploadFileToDB(fakeFile, fakeUser);
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
            const oldPath = "./" + fakeFile.path;
            const newPath = "./public/pictures/" + fakeUser.username + "/" + fakeFile.originalname;
            try {
                expect(fs.existsSync(oldPath)).to.be.true;
                pictureModel.moveFileToFolder(fakeFile, fakeUser);
                await sleep(500);
                expect(fs.existsSync(newPath)).to.be.true;


            } catch (e) {
                console.log(e.message);
            }

            deleteFile();
        });


    });

    //Doit nécessairement avoir un dossier pour l'uilisateur test créer au préalable
    // car la méthode createUsersPictureDirectory est privée
    describe('#findUsersPictures', async () => {

        it('should return an array of all images paths', async () => {
            await creatAndMoveFile();
            await creatAndMoveFile();
            await creatAndMoveFile();

            const paths: any[] = await pictureModel.findUsersPictures(fakeUser._id);
            expect(paths[0].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[1].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[2].picture.path).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            deleteFile();
        });

        async function creatAndMoveFile() {
            createFile();
            await sleep(300);
            await pictureModel.uploadFileToDB(fakeFile, fakeUser);
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