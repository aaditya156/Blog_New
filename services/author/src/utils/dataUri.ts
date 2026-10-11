import path from "path";

export interface ExpressFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export const getDataUri = (file: ExpressFile) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
