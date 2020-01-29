import "mocha";
import {expect} from "chai";
import {Db, MongoClient} from "mongodb";
import {AdminModel} from "../../../src/models/admin/AdminModel";
import {AdminModelImpl} from "../../../src/models/admin/AdminModelImpl";
import * as path from "path";
import * as fs from "fs";
import {Utils} from "../../../src/utils/Utils";

describe("AdminModelImpl", () => {

    let adminModel: AdminModel;
    let mongoClient: MongoClient;
    let db: Db;

    function createFolder(username: string) {
        const pathToFolder = path.join(Utils.__pathToStorage, username);
        if(!fs.existsSync(pathToFolder)){
            fs.mkdir(pathToFolder, (err) => {
                if (err) throw err;
            });
        }
    }

    function createFile(fileName: string, username: string) {
        const pathToFile = path.join(Utils.__pathToStorage, username, '/', fileName);
        fs.open(pathToFile, 'as', (err, fd) => {
            if (err) throw err;
            else fs.close(fd, (err) => {
                if (err) throw  err
            })
        });
    }

    function pathTo(username: string, fileName: string): string {
        return path.join(Utils.__pathToStorage , username , fileName);
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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

    describe('#deleteUser', async () => {
        const user = {username: 'user', password: 'pass'};
        it('should delete user from Db', async () => {
            createFolder(user.username);
            try {
                const userId = await db.collection('users').insertOne(user);
                await adminModel.deleteUser(userId.insertedId);
                expect((await db.collection('user').find({_id: userId.insertedId})).toArray(), "L'utilisateur n'a pas été supprimé de la base de donnée").to.be.empty;
            } catch (errors) {
                throw errors
            }
        });

        it('should delete user pictures and folder', async () => {
            try {
                createFolder(user.username);
                await sleep(400);
                createFile("a.txt", user.username);
                createFile("b.txt", user.username);
                createFile("c.txt", user.username);
                const userId = await db.collection('users').insertOne(user);
                await adminModel.deleteUser(userId.insertedId);
                expect(fs.existsSync(pathTo(user.username, "a.txt"))).to.be.false;
                expect(fs.existsSync(pathTo(user.username, "b.txt"))).to.be.false;
                expect(fs.existsSync(pathTo(user.username, "c.txt"))).to.be.false;
                expect(fs.existsSync(Utils.__pathToStorage + user.username)).to.be.false;
            } catch (errors) {
                throw errors
            }
        })
    });

    afterEach(async () => {
        await db.dropDatabase();
    });

    after(async () => {
        await mongoClient.close();
    });


});