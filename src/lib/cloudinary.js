import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dtiebz6dt",
  api_key: process.env.CLOUDINARY_API_KEY || "917975848548442",
  api_secret: process.env.CLOUDINARY_API_SECRET || "n2sFoq3s9w-nyn6coRuCeyh32-o",
});

export default cloudinary;