import { MongoClient, ObjectId, Collection } from "mongodb";

interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    authorId: string;
    author?: {
        _id: string;
        username: string;
        email: string;
  };
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }


    getAllImagesWithUsers(nameFilter?: string) {
        const pipeline: any[] = [];
        if (nameFilter) {
            pipeline.push({
                $match: {
                    name: { $regex: new RegExp(nameFilter, "i") }
                }
            });
        }

        pipeline.push(
            {
                $lookup: {
                    from: process.env.USERS_COLLECTION_NAME,
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author",
                },
            },
            {
                $unwind: "$author"
            },
            {
                $project: {
                    id: "$_id", //id and _id need duplication (not sure how to fix without renaming to _id over id)
                    _id: 1,
                    src: 1,
                    name: 1,
                    author: {
                        _id: 1,
                        username: 1,
                        email: 1
                    }
                }
            }
        );
        return this.collection.aggregate(pipeline).toArray();
    }
    

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const updatedName = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return updatedName.matchedCount;
    }

    getImagebyId(imageid: string) {
        return this.collection.findOne({ _id: new ObjectId(imageid)})
    }
    
}