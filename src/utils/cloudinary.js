import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export const uploadonCloudinary = async (localfilepath) => {
  // console.log("data of localfilepath in cloudianry code:", localfilepath);
  try {
    // console.log("IN TRY ");
    if (!localfilepath) return null;
    // 1 upload file on cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    // 2 file has been uploaded
    // console.log("file has been uploaded", response.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    // remove locally saved file as the upload operation got failed
    console.error("Cloudinary upload failed:", error);

    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    } else {
      console.log("File not found for deletion:", localfilepath);
    }

    return console.log("IN THE LAST LINE OF CATCH");
  }
};

export const deleteFromCloudinary = async (
  public_id,
  resourceType = "image"
) => {
  try {
    if (!public_id) return null;

    // Delete the file from cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });

    // Return the result
    return result;
  } catch (error) {
    console.error("Error while deleting from cloudinary:", error);
    return null;
  }
};
