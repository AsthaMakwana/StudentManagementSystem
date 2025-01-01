// declare namespace Express {
//     interface Request {
//         user?: { id: string; username: string; role: string };
//         file?: {
//             filename: string;
//             path: string;
//             mimetype: string;
//             size: number;
//             originalname: string;
//           };
//     }
// }
// types/express.d.ts
import { User } from './models/User'; // Adjust the import path as needed

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
