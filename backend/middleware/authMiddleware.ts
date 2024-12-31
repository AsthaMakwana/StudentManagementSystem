import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User {
    id: string;
    username: string;
    role: string;
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        req.user = decoded as User;
        next();
    });
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
    
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: "Admins Only!!" });
        return;
    }
    next();
};
