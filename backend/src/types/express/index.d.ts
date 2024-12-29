declare namespace Express {
    export interface Request {
        user?: {
            userId: number;
            isAdmin: boolean;
        }
    }
}
