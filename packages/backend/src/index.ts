import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes, verifyAuthToken } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);
const credentialsProvider = new CredentialsProvider(mongoClient);

const app = express();
app.use(express.static(STATIC_DIR));

app.use(express.json()); //middleware

app.locals.JWT_SECRET = process.env.JWT_SECRET;


export function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}


app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.use("/api/*", verifyAuthToken);
registerImageRoutes(app, imageProvider);
registerAuthRoutes(app, credentialsProvider);

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile("index.html", {root: STATIC_DIR})
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
