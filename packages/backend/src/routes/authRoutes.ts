import { CredentialsProvider } from "../CredentialsProvider";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: IAuthTokenPayload // Let TS know what type req.user should be
    }
}

export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction // Call next() to run the next middleware or request handler
) {
    const authHeader = req.get("Authorization");
    // The header should say "Bearer <token string>".  Discard the Bearer part.
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
    } else { // JWT_SECRET should be read in index.ts and stored in app.locals
        jwt.verify(token, req.app.locals.JWT_SECRET as string, (error, decoded) => {
            if (decoded) {
                req.user = decoded as IAuthTokenPayload; // Modify the request for subsequent handlers
                next();
            } else {
                res.status(403).end();
            }
        });
    }
}


function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {
    app.post("/auth/register", async (req: Request, res: Response) => {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            res.status(400).send({
            error: "Bad request",
            message: "Missing username or password"
            });
            return;
        }

        credentialsProvider.registerUser(username, password)
            .then(successful => {
                if (!successful) {
                    res.status(409).send("username already taken");
                    return;
                }
                const jwtsecret = req.app.locals.JWT_SECRET;
                return generateAuthToken(username, jwtsecret);
            }).then((token) => {
                if (token) {
                    res.status(200).send({token});
                }
            }).catch(() => {
                res.status(500).json({ error: "Some error occurred" });
                return;
            });
    });


    app.post("/auth/login", (req: Request, res: Response) => {
        const username = req.body.username;
        const password = req.body.password;
        
        if (!username || !password) {
            res.status(400).send({
            error: "Bad request",
            message: "Missing username or password"
            });
            return;
        }
        credentialsProvider.verifyPassword(username, password)
            .then(successful => {
                if (!successful) {
                    res.status(401).send("Bad username or password");
                    return;
                }
                const jwtsecret = req.app.locals.JWT_SECRET;
                return generateAuthToken(username, jwtsecret);
            }).then((token) => {
                if (token) {
                    res.status(200).send({token});
                }
            }).catch(() => {
                res.status(500).json({ error: "Some error occurred in login" });
                return;
            });
    })
}