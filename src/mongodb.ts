import { MongoClient, Db, Collection, type Document } from "mongodb"

const MONGO_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017"
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME ?? "catnip"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectMongo(): Promise<Db> {
    if (db) return db

    client = new MongoClient(MONGO_URI)
    await client.connect()
    db = client.db(DEFAULT_DB_NAME)

    console.log("Connected to MongoDB", { uri: MONGO_URI, db: DEFAULT_DB_NAME })
    return db
}

export async function disconnectMongo(): Promise<void> {
    if (!client) return
    await client.close()
    client = null
    db = null
}

export function getDb(): Db {
    if (!db) {
        throw new Error("MongoDB not connected. Call connectMongo() first.")
    }
    return db
}

export async function getCollection<TSchema extends Document>(name: string): Promise<Collection<TSchema>> {
    return (await connectMongo()).collection<TSchema>(name)
}

export default {
    connectMongo,
    disconnectMongo,
    getDb,
    getCollection,
}
