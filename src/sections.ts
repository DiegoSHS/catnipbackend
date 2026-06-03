import { Binary, ObjectId } from "mongodb"
import { getCollection } from "./mongodb"

type SectionType = "WARNING" | "NOTE" | "DEFAULT"

type SectionSchema = {
    _id?: ObjectId
    type: SectionType
    size: string
    title: string
    description: string
    image: Binary
    imageMimeType?: string
    createdAt: Date
    updatedAt: Date
}

export type SectionInput = {
    type: SectionType
    size: string
    title: string
    description: string
    image: string
    imageMimeType?: string
}

export type SectionUpdateInput = Partial<SectionInput>

function decodeBase64Image(value: string): Uint8Array {
    const cleaned = value.replace(/^data:.*;base64,/, "")
    return Buffer.from(cleaned, "base64")
}

function serializeSection(section: SectionSchema & { _id: ObjectId }) {
    return {
        id: section._id.toString(),
        type: section.type,
        size: section.size,
        title: section.title,
        description: section.description,
        image: section.image ? Buffer.from(section.image.buffer).toString("base64") : null,
        imageMimeType: section.imageMimeType ?? null,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
    }
}

export async function getSections() {
    const collection = await getCollection<SectionSchema>("section")
    const sections = await collection.find().toArray()
    return sections.map((section) => serializeSection(section as SectionSchema & { _id: ObjectId }))
}

export async function getSectionById(id: string) {
    const collection = await getCollection<SectionSchema>("section")
    const section = await collection.findOne({ _id: new ObjectId(id) })
    return section ? serializeSection(section as SectionSchema & { _id: ObjectId }) : null
}

export async function getSectionImage(id: string) {
    const collection = await getCollection<SectionSchema>("section")
    const section = await collection.findOne({ _id: new ObjectId(id) })
    if (!section) return null
    return {
        image: new Uint8Array(section.image.buffer),
        mimeType: section.imageMimeType ?? "application/octet-stream",
    }
}

export async function createSection(data: SectionInput) {
    const collection = await getCollection<SectionSchema>("section")
    const imageData = decodeBase64Image(data.image)
    const now = new Date()

    const result = await collection.insertOne({
        type: data.type,
        size: data.size,
        title: data.title,
        description: data.description,
        image: new Binary(imageData),
        imageMimeType: data.imageMimeType,
        createdAt: now,
        updatedAt: now,
    })

    return getSectionById(result.insertedId.toString())
}

export async function updateSection(id: string, data: SectionUpdateInput) {
    const collection = await getCollection<SectionSchema>("section")
    const update: Partial<SectionSchema> = {
        updatedAt: new Date(),
    }

    if (typeof data.type === "string") update.type = data.type as SectionType
    if (typeof data.size === "string") update.size = data.size
    if (typeof data.title === "string") update.title = data.title
    if (typeof data.description === "string") update.description = data.description
    if (typeof data.image === "string") update.image = new Binary(decodeBase64Image(data.image))
    if (typeof data.imageMimeType === "string") update.imageMimeType = data.imageMimeType

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: update })
    return getSectionById(id)
}

export async function deleteSection(id: string) {
    const collection = await getCollection<SectionSchema>("section")
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
}

export default {
    getSections,
    getSectionById,
    getSectionImage,
    createSection,
    updateSection,
    deleteSection,
}
