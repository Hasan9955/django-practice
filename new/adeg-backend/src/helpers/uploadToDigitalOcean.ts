import { S3Client, ObjectCannedACL } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import ApiError from "../errors/ApiErrors";

const S3_CONFIG = {
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.SPACE_ACCESS_KEY!,
    secretAccessKey: process.env.SPACE_SECRET_KEY!,
  },
  bucketName: "adeg3",
};

const s3 = new S3Client({
  region: S3_CONFIG.region,
  credentials: S3_CONFIG.credentials,
});

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

const uploadToAWS = async (file: Express.Multer.File): Promise<string> => {
  try {
    if (!file) throw new ApiError(400, "No file provided");
    if (file.size > MAX_FILE_SIZE)
      throw new ApiError(400, `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB`);

    const mimeType = file.mimetype || "application/octet-stream";
    const fileExtension = path.extname(file.originalname) || "";
    const fileName = `image/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: S3_CONFIG.bucketName,
        Key: fileName,
        Body: file.buffer,
        ACL: "public-read" as ObjectCannedACL,
        ContentType: mimeType,
      },
    });

    const data = await upload.done();

    // ✅ AWS returns Location automatically
    return data.Location!;
  } catch (error) {
    console.error(error, "check error");
    throw new ApiError(
      500,
      error instanceof Error
        ? `Failed to upload file: ${error.message}`
        : "Failed to upload file to AWS S3"
    );
  }
};

export default uploadToAWS;
