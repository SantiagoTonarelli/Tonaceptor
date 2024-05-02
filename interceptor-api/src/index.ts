import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import axios, { AxiosRequestConfig } from "axios";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import cors from "cors";

import RequestSchema from "./Models/Request";

interface Error {
  message: string;
}

mongoose.connect(process.env.MONGO_URI as string);

interface IRequest extends Request {
  headers: {
    [key: string]: string | undefined;
    originalurl?: string;
  };
}

const RequestModel = mongoose.model("Request", RequestSchema);

const app = express();
const port = process.env.PORT || 3001;
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.all("/itona", async (req: Request, res: Response, next: NextFunction) => {
  const request = req as IRequest;
  const savedRequest = new RequestModel({
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: request.body,
    query: request.query,
    timestamp: new Date(),
  });

  const originalUrl = Array.isArray(req.headers.originalurl)
    ? req.headers.originalurl[0]
    : req.headers.originalurl;
  try {
    await savedRequest.save();
    io.emit("newRequest", savedRequest);
    if (req.headers.originalurl) {
      const config: AxiosRequestConfig = {
        method: req.method as "get" | "post" | "put" | "delete" | "patch",
        url: originalUrl,
        headers: req.headers,
        data: req.body,
        params: req.query,
      };

      const response = await axios(config);
      res.send(response.data);
    } else {
      res.send("Request saved");
    }
  } catch (error) {
    res.status(500).send((error as Error).message || "Internal server error");
  }
});

app.delete("/requests", async (req: Request, res: Response) => {
  await RequestModel.deleteMany({});
  res.send("All requests deleted");
});

io.on("connection", async (socket) => {
  console.log("A user connected");

  const requests = await RequestModel.find().sort({ timestamp: "desc" });

  socket.emit("initialRequests", requests);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
