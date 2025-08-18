import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
    cloud_name:"djqpuii9g",
    api_key:"526684498364392",
    api_secret:"FqPSDE60AISIkyhHeCPG6RQVLo0"
});

export const uploadFile = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        console.log(result);
        return result
        
    } catch (error) {
        console.error(error.message);
    }
}
