import "mocha";
import {expect} from "chai";
import {Db, MongoClient} from "mongodb";
import {AdminModel} from "../../../src/models/admin/AdminModel";
import {AdminModelImpl} from "../../../src/models/admin/AdminModelImpl";

describe("AdminModelImpl", () => {

    let adminModel: AdminModel;
    let mongoClient: MongoClient;
    let db: Db;


    before(async () => {
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true});
        db = mongoClient.db('test');
        adminModel = new AdminModelImpl(db);
    });

    describe("#getUsers", async () => {
        const user0 = {username: "user1", password: ""};
        const user1 = {username: "user2", password: ""};
        const user2 = {username: "user3", password: ""};
        const user3 = {username: "user4", password: ""};

        it("should return all users", async () => {
            try {
                const user0ID = await db.collection('users').insertOne(user0);
                const user1ID = await db.collection('users').insertOne(user1);
                const user2ID = await db.collection('users').insertOne(user2);
                const user3ID = await db.collection('users').insertOne(user3);
                const allUsers: any[] = await adminModel.getUsers();
                expect(allUsers).to.deep.contain({
                    _id: user0ID.insertedId,
                    username: user0.username,
                    password: user0.password
                });
                expect(allUsers).to.deep.contain({
                    _id: user1ID.insertedId,
                    username: user1.username,
                    password: user1.password
                });
                expect(allUsers).to.deep.contain({
                    _id: user2ID.insertedId,
                    username: user2.username,
                    password: user2.password
                });
                expect(allUsers).to.deep.contain({
                    _id: user3ID.insertedId,
                    username: user3.username,
                    password: user3.password
                });
            } catch (errors) {
                throw errors;
            }
        });
    });



    afterEach(async () => {
        await db.dropDatabase();
    });

    after(async () => {
        await mongoClient.close();
    });


});