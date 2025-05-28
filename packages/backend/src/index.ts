import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);

const app = express();
app.use(express.static(STATIC_DIR));

app.use(express.json()); //middleware


export function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}


app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

registerImageRoutes(app, imageProvider);

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile("index.html", {root: STATIC_DIR})
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
