import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto', // Auto-detect (image, video, raw/pdf)
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        reject(error);
                        return;
                    }
                    if (result && result.secure_url) {
                        resolve(result.secure_url);
                    } else {
                        reject(new Error('Upload successful but no URL returned'));
                    }
                }
            ).end(buffer);
        });
    } catch (error) {
        console.error('Upload Helper Error:', error);
        throw error;
    }
};
