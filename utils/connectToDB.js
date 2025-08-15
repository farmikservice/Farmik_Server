import mongoose from "mongoose"

export default async function connectToDB(){
    await mongoose.connect(process.env.MONGO_ATLAS_URL)
}