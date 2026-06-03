import { Binary, ObjectId } from "mongodb"
import { getCollection } from "./mongodb"

type CreationSchema = {
    _id?: ObjectId
    profileId: ObjectId
    image: Binary
    link: string
    imageMimeType?: string
    createdAt: Date
    updatedAt: Date
}

export type CreationInput = {
    image: string
    link: string
    imageMimeType?: string
}

export type CreationUpdateInput = Partial<CreationInput>

function decodeBase64Image(value: string): Uint8Array {
    const cleaned = value.replace(/^data:.*;base64,/, "")
    return Buffer.from(cleaned, "base64")
}

function serializeCreation(creation: CreationSchema & { _id: ObjectId }) {
    return {
        id: creation._id.toString(),
        profileId: creation.profileId.toString(),
        image: creation.image ? Buffer.from(creation.image.buffer).toString("base64") : null,
        link: creation.link,
        imageMimeType: creation.imageMimeType ?? null,
        createdAt: creation.createdAt,
        updatedAt: creation.updatedAt,
    }
}

export async function getCreationsForProfile(profileId: string) {
    const collection = await getCollection<CreationSchema>("creation")
    const creations = await collection
        .find({ profileId: new ObjectId(profileId) })
        .toArray()
    return creations.map((creation) => serializeCreation(creation as CreationSchema & { _id: ObjectId }))
}

export async function getCreationById(profileId: string, id: string) {
    const collection = await getCollection<CreationSchema>("creation")
    const creation = await collection.findOne({
        _id: new ObjectId(id),
        profileId: new ObjectId(profileId),
    })
    return creation ? serializeCreation(creation as CreationSchema & { _id: ObjectId }) : null
}

export async function getCreationImage(profileId: string, id: string) {
    const collection = await getCollection<CreationSchema>("creation")
    const creation = await collection.findOne({
        _id: new ObjectId(id),
        profileId: new ObjectId(profileId),
    })
    if (!creation) return null
    return {
        image: new Uint8Array(creation.image.buffer),
        mimeType: creation.imageMimeType ?? "application/octet-stream",
    }
}

export async function createCreation(profileId: string, data: CreationInput) {
    const collection = await getCollection<CreationSchema>("creation")
    const imageData = decodeBase64Image(data.image)
    const now = new Date()
    const result = await collection.insertOne({
        profileId: new ObjectId(profileId),
        image: new Binary(imageData),
        link: data.link,
        imageMimeType: data.imageMimeType,
        createdAt: now,
        updatedAt: now,
    })
    return getCreationById(profileId, result.insertedId.toString())
}

export async function updateCreation(profileId: string, id: string, data: CreationUpdateInput) {
    const collection = await getCollection<CreationSchema>("creation")
    const update: Partial<CreationSchema> = {
        updatedAt: new Date(),
    }
    if (typeof data.link === "string") update.link = data.link
    if (typeof data.image === "string") update.image = new Binary(decodeBase64Image(data.image))
    if (typeof data.imageMimeType === "string") update.imageMimeType = data.imageMimeType

    await collection.updateOne(
        { _id: new ObjectId(id), profileId: new ObjectId(profileId) },
        { $set: update },
    )
    return getCreationById(profileId, id)
}

export async function deleteCreation(profileId: string, id: string) {
    const collection = await getCollection<CreationSchema>("creation")
    const result = await collection.deleteOne({
        _id: new ObjectId(id),
        profileId: new ObjectId(profileId),
    })
    return result.deletedCount === 1
}

export default {
    getCreationsForProfile,
    getCreationById,
    getCreationImage,
    createCreation,
    updateCreation,
    deleteCreation,
}
