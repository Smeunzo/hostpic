import {expect} from "chai";
import "mocha";
import * as bcrypt from "bcrypt";
import {AuthModelImpl} from "../../../src/models/auth/AuthModelImpl"
import {MongoClient, Db, ObjectID} from "mongodb";
import {ValidationError} from "class-validator";

describe('AuthModelImpl', () => {
    let authModel: AuthModelImpl;
    let mongoClient: MongoClient;
    let db: Db;

    const logInData = {username: 'bob', password: 'toto'};
    const logInData2 = {username: 'bb', password: 'ccazdazdzdadazdazdadazdazdazdazdazdazazdazdazdaz'};
    logInData.username = 'bob';
    logInData.password = 'toto';

    function extractMessages(errors: ValidationError[]): string[] {
        const messages = [];
        for (const error of errors)
            for (const key in error.constraints)
                messages.push(error.constraints[key]);
        return messages;
    }

    before(async () => {
        mongoClient = await MongoClient.connect('mongodb://localhost', {useUnifiedTopology: true});
        db = mongoClient.db('test');
        authModel = new AuthModelImpl(db);
    });

    describe('#getUserId', async () => {
        it('should return the user id', async () => {
            const result = await db.collection('users').insertOne({
                username: logInData.username,
                password: await bcrypt.hash(logInData.password, 10)
            });
            const id = result.insertedId;
            expect((await authModel.getUserId(logInData)).toString()).be.equal(id.toString());
        });
        it('should validate data', async () => {
            try {
                await authModel.getUserId(logInData2);
            } catch (exception) {
                expect(extractMessages(exception)).includes.deep.members(['Username is too short', 'Password is too long']);
                return;
            }
            expect.fail();
        });
    });

    describe('#getUserFromId', async () => {
        it('should return the user object', async () => {
            const result = await db.collection('users').insertOne({
                username: logInData.username,
                password: await bcrypt.hash(logInData.password, 10)
            });
            const id = result.insertedId;
            expect((await authModel.getUserFromId(id))).be.deep.equals({_id: id, username: logInData.username});
        });
        it('should throw "User not found"', async () => {
            try {
                await authModel.getUserFromId(new ObjectID());
            } catch (exception) {
                expect(exception.message).to.be.equals('User not found');
                return;
            }
            expect.fail();
        });
    });

    describe('#signUp', async () => {
        it('should add a user and return the id', async () => {
            try{
                const id = await authModel.signUp(logInData);
                const user = await db.collection('users').findOne({_id: id});
                expect(user.username).be.deep.equals(logInData.username);
            }catch (errors) {
                throw errors;
            }
        });

        it('should hash the password', async () => {
            const id = await authModel.signUp(logInData);
            const user = await db.collection('users').findOne({_id: id});
            expect(await bcrypt.compare(logInData.password, user.password)).to.be.true;
        });

        it('should throw "Username already exists"', async () => {
            try {
                await authModel.signUp(logInData);
                await authModel.signUp(logInData);
            } catch (exception) {
                expect(exception.message).to.be.equals('Username already exists');
                return;
            }
            expect.fail();
        });
        it('should validate data', async () => {
            try {
                await authModel.signUp(logInData2);
            } catch (exception) {
                expect(extractMessages(exception)).includes.deep.members(['Username is too short', 'Password is too long']);
                return;
            }
            expect.fail();
        });
    });

    afterEach(async () => {
        await db.dropDatabase();
    });

    after(async () => {
        await mongoClient.close();
    });

});