import mongoose from "mongoose";

const pdfDocumentSchema = new mongoose.Schema(
  {
    pdfUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("PdfDocument", pdfDocumentSchema);
