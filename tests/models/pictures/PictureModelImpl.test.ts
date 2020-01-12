import {expect} from "chai";
import {PictureModelImpl} from "../../../src/models/picture/PictureModelImpl";
import {Db, MongoClient, ObjectID} from "mongodb";
import {Picture} from "../../../src/models/picture/Picture";
import {Request, request} from "express";
import {User} from "../../../src/models/auth/User";

describe('PictureModelImpl', () => {

    let pictureModel: PictureModelImpl;
    let mongoClient: MongoClient;
    let db: Db;

    let picture: Picture;


    before(async () => {
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true});
        db = mongoClient.db('test');
        pictureModel = new PictureModelImpl(db);
    });

    describe('#uploadFile', async () => {
        const fakeUser: User = {_id: new ObjectID(), username: "test"};
        let emptyFile: Request['file'];

        let emptyUser: User;
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


    });

    afterEach(async () => {
        await db.dropDatabase();
    });

    after(async () => {
        await mongoClient.close()
    });
});