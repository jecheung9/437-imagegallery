import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    _id: string;
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;
    private readonly mongoClient: MongoClient;

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const checkUser = await this.collection.findOne({ username });
        if (checkUser) {
            return false;
        }
        const salt = await bcrypt.genSalt(10);
        console.log("Salt:", salt);
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
        console.log("Hash:", hashedPassword);
        await this.collection.insertOne({
            _id: username,
            username: username,
            password: hashedPassword
        });

        const usersCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!usersCollectionName) {
            throw new Error("Missing USERS_COLLECTION_NAME from env file");
        }
        const usersCollection = this.mongoClient.db().collection<{ _id: string; username: string; email: string }>(usersCollectionName);
        await usersCollection.insertOne({
            _id: username,
            username,
            email: `${username}@example.com`, 
        });

        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        const user = await this.collection.findOne({ username });
        if (!user) {
            return false;
        }
        const hashedDatabasePassword = user.password; 
        return await bcrypt.compare(plaintextPassword, hashedDatabasePassword);
    }
}
