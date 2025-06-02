import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { waitDuration } from "../index";
import { NextFunction } from "express";
import { ObjectId } from "mongodb";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {

    
    app.get("/api/images", async (req: Request, res: Response) => {
        await waitDuration(1000)
        // await waitDuration(Math.random() * 5000)
            .then(() => {
                return imageProvider.getAllImagesWithUsers();
                // return imageProvider.getAllImages();
            }).then((data) => {
                res.json(data);
            }).catch(() => {
                res.status(500).json({ error: "Failed to fetch images" });
            });
    });

    app.get("/api/images/search", async (req: Request, res: Response) => {
        const nameQuery = typeof req.query.name === 'string' ? req.query.name : '';
        await waitDuration(1000)
        // await waitDuration(Math.random() * 5000)
            .then(() => {
                return imageProvider.getAllImagesWithUsers(nameQuery);
            }).then((data) => {
                res.json(data);
            }).catch(() => {
                res.status(500).json({ error: "Failed to fetch images" });
            });
    });

    const MAX_NAME_LENGTH = 100;

    app.put("/api/images/:id", (req: Request, res: Response, next: NextFunction) => {
        const imageId = req.params.id;
        const newName = req.body.name;
        const user = req.user?.username;

        if (!user) {
            res.status(401).send();
            return;
        }

        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
            error: "Not Found",
            message: "Image does not exist"
            });
            return;
        }

        if (typeof newName !== "string") {
            res.status(400).send({
            error: "Bad Request",
            message: "bad format"
            });
            return;
        }

        if (newName.length > MAX_NAME_LENGTH) {
            res.status(422).send({
            error: "Unprocessable Entity",
            message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
            return;
        }

        imageProvider.getImagebyId(imageId)
            .then(image => {
                if (!image) {
                    res.status(404).send({
                        error: "Not Found",
                        message: "image not found"
                    });
                    return;
                }

                if (image.authorId !== user) {
                    res.status(403).send({
                        error: "Unauthorized",
                        message: "not the right user"
                    });
                    return;
                }
                return imageProvider.updateImageName(imageId, newName)
            })
            .then((result) => {
                if (result !== undefined) {
                    res.status(204).send();
                }
            }).catch(() => {
                res.status(500).json({ error: "Failed to update image" });
                return;
            });
        });

}

