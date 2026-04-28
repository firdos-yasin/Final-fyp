import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,       // CLOUD_KEY tha → API_KEY kiya
        api_secret: process.env.CLOUDINARY_API_SECRET, // CLOUD_SECRET tha → API_SECRET kiya
    });
};

export default connectCloudinary