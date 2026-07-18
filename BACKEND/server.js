import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";
import PdfDocument from "./models/PdfDocument.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (_req, res) => {
  res.json({ message: "PDF distribution API is running." });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported." });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "pdf-distribution",
          access_mode: "public",
        },
        (error, uploaded) => {
          if (error) return reject(error);
          resolve(uploaded);
        },
      );

      stream.end(req.file.buffer);
    });

    const pdfName = req.body.name || req.file.originalname || "document.pdf";

    const document = await PdfDocument.create({
      pdfUrl: result.secure_url,
      name: pdfName,
    });

    const baseUrl = (
      process.env.APP_BASE_URL || `https://localhost:${port}`
    ).replace(/\/$/, "");
    const publicLink = `${baseUrl}/www.betterbusinesssubmit.com/wp-content/uploads/invitation-letter/pdf/t${document._id}`;

    res.json({ link: publicLink });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload PDF." });
  }
});

const servePdfDownload = async (req, res) => {
  try {
    const document = await PdfDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: "PDF not found." });
    }

    const response = await fetch(document.pdfUrl);

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "Failed to fetch the PDF from storage." });
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    const downloadName = document.name || "document.pdf";
    const safeName = downloadName.replace(/"/g, "'");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(
        safeName,
      )}`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF download error:", error);
    return res.status(500).json({ error: "Failed to download PDF." });
  }
};

app.get("/pdf/:id", servePdfDownload);
app.get(
  "/www.betterbusinesssubmit.com/wp-content/uploads/invitation-letter/pdf/t:id",
  servePdfDownload,
);

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pdf-distribution",
    );
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
