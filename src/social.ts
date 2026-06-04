import { ObjectId } from "mongodb"
import { getCollection } from "./mongodb"

type SocialSchema = {
    _id?: ObjectId
    profileId: ObjectId
    name: string
    link: string
    color: string
    createdAt: Date
    updatedAt: Date
}

export type SocialInput = {
    name: string
    link: string
    color: string
}

export type SocialUpdateInput = Partial<SocialInput>

function serializeSocial(social: SocialSchema & { _id: ObjectId }) {
    return {
        id: social._id.toString(),
        profileId: social.profileId.toString(),
        name: social.name,
        link: social.link,
        color: social.color,
        createdAt: social.createdAt,
        updatedAt: social.updatedAt,
    }
}

export async function getSocialsForProfile(profileId: string) {
    const collection = await getCollection<SocialSchema>("social")
    const socials = await collection
        .find({ profileId: new ObjectId(profileId) })
        .toArray()
    return socials.map((social) => serializeSocial(social as SocialSchema & { _id: ObjectId }))
}

export async function getSocialById(profileId: string, socialId: string) {
    const collection = await getCollection<SocialSchema>("social")
    const social = await collection.findOne({
        _id: new ObjectId(socialId),
        profileId: new ObjectId(profileId),
    })
    return social ? serializeSocial(social as SocialSchema & { _id: ObjectId }) : null
}

export async function createSocial(profileId: string, data: SocialInput) {
    const collection = await getCollection<SocialSchema>("social")
    const now = new Date()
    const result = await collection.insertOne({
        profileId: new ObjectId(profileId),
        name: data.name,
        link: data.link,
        color: data.color,
        createdAt: now,
        updatedAt: now,
    })
    return getSocialById(profileId, result.insertedId.toString())
}

export async function updateSocial(profileId: string, socialId: string, data: SocialUpdateInput) {
    const collection = await getCollection<SocialSchema>("social")
    const update: Partial<SocialSchema> = {
        updatedAt: new Date(),
    }
    if (typeof data.name === "string") update.name = data.name
    if (typeof data.link === "string") update.link = data.link
    if (typeof data.color === "string") update.color = data.color
    await collection.updateOne(
        { _id: new ObjectId(socialId), profileId: new ObjectId(profileId) },
        { $set: update },
    )

    return getSocialById(profileId, socialId)
}

export async function deleteSocial(profileId: string, socialId: string) {
    const collection = await getCollection<SocialSchema>("social")
    const result = await collection.deleteOne({
        _id: new ObjectId(socialId),
        profileId: new ObjectId(profileId),
    })
    return result.deletedCount === 1
}

export default {
    getSocialsForProfile,
    getSocialById,
    createSocial,
    updateSocial,
    deleteSocial,
}
