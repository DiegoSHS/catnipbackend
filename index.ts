import { connectMongo } from "./src/mongodb"
import profiles, { type ProfileInput, type ProfileUpdateInput } from "./src/profiles"

await connectMongo()

Bun.serve({
    port: 3000,
    routes: {
        "/profile": {
            GET: async () => {
                const profilesList = await profiles.getProfiles()
                return Response.json(profilesList)
            },
            POST: async (req) => {
                const body = await req.json() as ProfileInput
                const profile = await profiles.createProfile(body)
                return Response.json(profile, { status: 201 })
            },
        },
        "/profile/:id": {
            GET: async (req) => {
                const profile = await profiles.getProfileById(req.params.id)
                return profile ? Response.json(profile) : new Response(null, { status: 404 })
            },
            PUT: async (req) => {
                const body = await req.json() as ProfileUpdateInput
                const profile = await profiles.updateProfile(req.params.id, body)
                return profile ? Response.json(profile) : new Response(null, { status: 404 })
            },
            DELETE: async (req) => {
                const deleted = await profiles.deleteProfile(req.params.id)
                return new Response(null, { status: deleted ? 204 : 404 })
            },
        },
        "/profile/:id/image": {
            GET: async (req) => {
                const imageResponse = await profiles.getProfileImage(req.params.id)
                if (!imageResponse) return new Response(null, { status: 404 })
                return new Response(imageResponse.image, {
                    status: 200,
                    headers: { "Content-Type": imageResponse.mimeType },
                })
            },
        },
        "/section/:sectionId": {
            GET: async (req) => {
                const { sectionId } = req.params
                return Response.json({ sectionId, name: "Section Name", description: "Section Description" })
            },
        },
    },
})
