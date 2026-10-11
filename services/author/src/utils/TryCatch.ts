import { Request, Response, NextFunction, RequestHandler } from "express";

export const TryCatch = (func: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
