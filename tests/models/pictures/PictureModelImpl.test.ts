import {expect} from "chai";
import {PictureModelImpl} from "../../../src/models/picture/PictureModelImpl";
import {Db, MongoClient} from "mongodb";
import {Picture} from "../../../src/models/picture/Picture";
import {Request, request} from "express";

describe('PictureModelImpl',() =>{

    let pictureModel : PictureModelImpl;
    let mongoClient : MongoClient;
    let db : Db;
    let file : Request["file"];
    let picture : Picture;

    before(async () =>{
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology : true});
        db = mongoClient.db('test');
        pictureModel = new PictureModelImpl(db);
    });

    describe('#uploadFile', async () =>{

    });

    afterEach( async () =>{
        await db.dropDatabase();
    });

    after(async  () =>{
        await mongoClient.close()
    });
});