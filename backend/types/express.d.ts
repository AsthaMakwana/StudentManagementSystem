declare namespace Express {
    interface Request {
        user?: { id: string; username: string; role: string };
        file?: {
            filename: string;
            path: string;
            mimetype: string;
            size: number;
            originalname: string;
          };
    }
}
