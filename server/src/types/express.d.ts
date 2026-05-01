import { User } from '../generated/client/client';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
            } | null;
        }
    }
}
