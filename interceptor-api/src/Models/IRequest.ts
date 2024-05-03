import { Request } from "express";

interface IRequest extends Request {
  headers: {
    [key: string]: string | undefined;
    originalurl?: string;
  };
}

export default IRequest;
