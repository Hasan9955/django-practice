import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../shared/prisma";
import fs from "fs";
import { fileUploader } from "../app/middlewares/fileUploder";

const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "file-upload",
  async (job) => {
    const { postId, files } = job.data;

    if (!postId || !files?.length) throw new Error("Missing postId or files");

    const uploadedUrls = await Promise.all(
      files.map(async (file: any) => {
        const result = await fileUploader.uploadToDigitalOcean(file);
        if (file.path && fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path); // ✅ remove temp file after upload
        }
        return result.Location;
      })
    );

    await prisma.nicheHub.update({
      where: { id: postId },
      data: { fileUrl: uploadedUrls },
    });

    console.log(`✅ File upload completed for post ${postId}`);
    return { postId, uploadedUrls };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`🎉 Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job failed: ${job?.id}`, err);
});

console.log("🚀 File Upload Worker is running...");
