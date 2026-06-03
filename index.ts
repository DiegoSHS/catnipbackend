import { connectMongo } from "./src/mongodb"
import profiles, { type ProfileInput, type ProfileUpdateInput } from "./src/profiles"
import socials, { type SocialInput, type SocialUpdateInput } from "./src/socials"
import sections, { type SectionInput, type SectionUpdateInput } from "./src/sections"
import creations, { type CreationInput, type CreationUpdateInput } from "./src/creations"

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
        "/profile/:id/social": {
            GET: async (req) => {
                const socialsList = await socials.getSocialsForProfile(req.params.id)
                return Response.json(socialsList)
            },
            POST: async (req) => {
                const body = await req.json() as SocialInput
                const social = await socials.createSocial(req.params.id, body)
                return Response.json(social, { status: 201 })
            },
        },
        "/profile/:id/social/:socialId": {
            GET: async (req) => {
                const social = await socials.getSocialById(req.params.id, req.params.socialId)
                return social ? Response.json(social) : new Response(null, { status: 404 })
            },
            PUT: async (req) => {
                const body = await req.json() as SocialUpdateInput
                const social = await socials.updateSocial(req.params.id, req.params.socialId, body)
                return social ? Response.json(social) : new Response(null, { status: 404 })
            },
            DELETE: async (req) => {
                const deleted = await socials.deleteSocial(req.params.id, req.params.socialId)
                return new Response(null, { status: deleted ? 204 : 404 })
            },
        },
        "/profile/:id/section": {
            GET: async (req) => {
                const sectionList = await sections.getSectionsForProfile(req.params.id)
                return Response.json(sectionList)
            },
            POST: async (req) => {
                const body = await req.json() as SectionInput
                const section = await sections.createSection(req.params.id, body)
                return Response.json(section, { status: 201 })
            },
        },
        "/profile/:id/section/:sectionId": {
            GET: async (req) => {
                const section = await sections.getSectionById(req.params.id, req.params.sectionId)
                return section ? Response.json(section) : new Response(null, { status: 404 })
            },
            PUT: async (req) => {
                const body = await req.json() as SectionUpdateInput
                const section = await sections.updateSection(req.params.id, req.params.sectionId, body)
                return section ? Response.json(section) : new Response(null, { status: 404 })
            },
            DELETE: async (req) => {
                const deleted = await sections.deleteSection(req.params.id, req.params.sectionId)
                return new Response(null, { status: deleted ? 204 : 404 })
            },
        },
        "/profile/:id/section/:sectionId/image": {
            GET: async (req) => {
                const imageResponse = await sections.getSectionImage(req.params.id, req.params.sectionId)
                if (!imageResponse) return new Response(null, { status: 404 })
                return new Response(imageResponse.image, {
                    status: 200,
                    headers: { "Content-Type": imageResponse.mimeType },
                })
            },
        },
        "/profile/:id/creation": {
            GET: async (req) => {
                const creationList = await creations.getCreationsForProfile(req.params.id)
                return Response.json(creationList)
            },
            POST: async (req) => {
                const body = await req.json() as CreationInput
                const creation = await creations.createCreation(req.params.id, body)
                return Response.json(creation, { status: 201 })
            },
        },
        "/profile/:id/creation/:creationId": {
            GET: async (req) => {
                const creation = await creations.getCreationById(req.params.id, req.params.creationId)
                return creation ? Response.json(creation) : new Response(null, { status: 404 })
            },
            PUT: async (req) => {
                const body = await req.json() as CreationUpdateInput
                const creation = await creations.updateCreation(req.params.id, req.params.creationId, body)
                return creation ? Response.json(creation) : new Response(null, { status: 404 })
            },
            DELETE: async (req) => {
                const deleted = await creations.deleteCreation(req.params.id, req.params.creationId)
                return new Response(null, { status: deleted ? 204 : 404 })
            },
        },
        "/profile/:id/creation/:creationId/image": {
            GET: async (req) => {
                const imageResponse = await creations.getCreationImage(req.params.id, req.params.creationId)
                if (!imageResponse) return new Response(null, { status: 404 })
                return new Response(imageResponse.image, {
                    status: 200,
                    headers: { "Content-Type": imageResponse.mimeType },
                })
            },
        },
    },
})
