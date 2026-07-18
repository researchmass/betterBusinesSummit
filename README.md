# MERN PDF Distribution System

This workspace contains a minimal PDF upload and share flow with:

- A Node.js + Express backend
- A React + Vite admin panel
- MongoDB storage for uploaded PDF metadata
- Cloudinary storage for the PDF files

## Backend

1. Open the backend folder.
2. Copy .env.example to .env and fill in your values.
3. Start the server:

```bash
npm install
npm run dev
```

## Frontend

1. Open the admin folder.
2. Start the admin app:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000

## How it works

- Upload a PDF from the admin panel.
- The backend uploads it to Cloudinary.
- The backend stores the Cloudinary URL in MongoDB.
- The admin panel shows a public link in the form:

```text
http://localhost:5000/pdf/<document-id>
```

That link can be converted into a QR code manually.
