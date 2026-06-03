import { Binary, ObjectId } from "mongodb"
import { getCollection } from "./mongodb"

type ProfileSchema = {
    _id?: ObjectId
    name: string
    description: string
    image: Binary
    imageMimeType?: string
    createdAt: Date
    updatedAt: Date
}

export type ProfileInput = {
    name: string
    description: string
    image: string
    imageMimeType?: string
}

export type ProfileUpdateInput = Partial<ProfileInput>

function decodeBase64Image(value: string): Uint8Array {
    const cleaned = value.replace(/^data:.*;base64,/, "")
    return Buffer.from(cleaned, "base64")
}

function serializeProfile(profile: ProfileSchema & { _id: ObjectId }) {
    return {
        id: profile._id.toString(),
        name: profile.name,
        description: profile.description,
        image: profile.image ? Buffer.from(profile.image.buffer).toString("base64") : null,
        imageMimeType: profile.imageMimeType ?? null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    }
}

export async function getProfiles() {
    const collection = await getCollection<ProfileSchema>("profiles")
    const profiles = await collection.find().toArray()
    return profiles.map((profile) => serializeProfile(profile as ProfileSchema & { _id: ObjectId }))
}

export async function getProfileById(id: string) {
    const collection = await getCollection<ProfileSchema>("profiles")
    const profile = await collection.findOne({ _id: new ObjectId(id) })
    return profile ? serializeProfile(profile as ProfileSchema & { _id: ObjectId }) : null
}

export async function getProfileImage(id: string) {
    const collection = await getCollection<ProfileSchema>("profiles")
    const profile = await collection.findOne({ _id: new ObjectId(id) })
    if (!profile) return null
    return {
        image: new Uint8Array(profile.image.buffer),
        mimeType: profile.imageMimeType ?? "application/octet-stream",
    }
}

export async function createProfile(data: ProfileInput) {
    const collection = await getCollection<ProfileSchema>("profiles")
    const imageData = decodeBase64Image(data.image)
    const now = new Date()

    const result = await collection.insertOne({
        name: data.name,
        description: data.description,
        image: new Binary(imageData),
        imageMimeType: data.imageMimeType,
        createdAt: now,
        updatedAt: now,
    })

    return getProfileById(result.insertedId.toString())
}

export async function updateProfile(id: string, data: ProfileUpdateInput) {
    const collection = await getCollection<ProfileSchema>("profiles")
    const update: Partial<ProfileSchema> = {
        updatedAt: new Date(),
    }

    if (typeof data.name === "string") update.name = data.name
    if (typeof data.description === "string") update.description = data.description
    if (typeof data.image === "string") update.image = new Binary(decodeBase64Image(data.image))
    if (typeof data.imageMimeType === "string") update.imageMimeType = data.imageMimeType

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
    return getProfileById(id)
}

export async function deleteProfile(id: string) {
    const collection = await getCollection<ProfileSchema>("profiles")
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
}

export default {
    getProfiles,
    getProfileById,
    getProfileImage,
    createProfile,
    updateProfile,
    deleteProfile,
}
