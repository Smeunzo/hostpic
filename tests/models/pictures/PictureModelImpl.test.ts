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
    let fakeFile: Request["file"] = {
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

    before(() =>{
        createFile();
    });

    beforeEach(async () => {
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true});
        db = mongoClient.db('test');
        pictureModel = new PictureModelImpl(db);
    });

    describe('#uploadFile', async () => {
        let emptyFile: Request['file'];
        let emptyUser: User;


        it("should throw \"Une erreur avec le fichier\"", async () => {
            try {
                await pictureModel.uploadFile(emptyFile, fakeUser);
            } catch (errors) {
                expect(errors.message).to.be.equals("Une erreur avec le fichier");
                return;
            }
            expect.fail()
        });


        it("should throw \"l'utilisateur n'est pas connecté\" ", async () => {
            try {
                await pictureModel.uploadFile(fakeFile, emptyUser);
            } catch (errors) {
                expect(errors.message).to.be.equals('L\'utilisateur n\'est pas connecté');
                return;
            }
            expect.fail();
        });

        it('should add a picture for specified user', async () => {
            try {
                await pictureModel.uploadFile(fakeFile, fakeUser);
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
            const oldPath = fakeFile.path;
            const newPath = "/public/pictures/" + fakeUser.username + "/" + fakeFile.originalname;
            try {
                setTimeout(async () => {
                    await pictureModel.uploadFile(fakeFile, fakeUser);
                }, 700);
                expect(fs.existsSync(oldPath)).to.be.equals(false);
                setTimeout(() => {
                    expect(fs.existsSync(newPath)).to.be.true;
                }, 1200);
            } catch (e) {
                console.log(e.message);
            }
        });
        after(() => {
            deleteFile();
        });


    });

    describe('#findUsersPictures', async () => {

        it('should return an array of all images paths', async () => {
            createFile();
            await pictureModel.uploadFile(fakeFile, fakeUser);
            createFile();
            await pictureModel.uploadFile(fakeFile, fakeUser);
            createFile();
            await pictureModel.uploadFile(fakeFile, fakeUser);
            const paths: string[] = await pictureModel.findUsersPictures(fakeUser);
            expect(paths[0]).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[1]).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            expect(paths[2]).to.be.equals("/pictures/" + fakeUser.username + "/" + fakeFile.originalname);
            deleteFile();
        })
    });


    afterEach(async () => {
        await db.dropDatabase();
    });

    after(async () => {
        await mongoClient.close()
    });


    function createFile() {
        const pathToFile = path.join("./public/pictures/", "image.png");
        fs.open(pathToFile, 'w+', (err) => {
            if (err) throw err;
        });
    }

    function deleteFile() {
        const pathToFile = path.join("./public/pictures/", fakeUser.username, "image.png");
        fs.unlink(pathToFile, (err) => {
            if (err) throw err;
        })
    }
});