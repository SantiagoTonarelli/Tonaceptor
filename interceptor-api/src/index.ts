import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import axios, { AxiosRequestConfig } from "axios";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import https from "https";
import cors from "cors";

import RequestSchema from "./Models/Request";
import SimulatedRequestSchema from "./Models/SimulatedRequest";
import IRequest from "./Models/IRequest";
import removeHeadersFilter from "./helpers/headersFilter";

interface Error {
  message: string;
}

mongoose.connect(process.env.MONGO_URI as string);

const RequestModel = mongoose.model("Request", RequestSchema);
const SimulatedRequestModel = mongoose.model(
  "SimulatedRequest",
  SimulatedRequestSchema
);

const app = express();
const port = process.env.PORT || 3001;
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.all("/itona*", async (req: Request, res: Response, next: NextFunction) => {
  const request = req as IRequest;
  const savedRequest = new RequestModel({
    method: request.method,
    url: request.url.replace("/itona", "/").replace("//", "/"),
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
      removeHeadersFilter(request);
      const config: AxiosRequestConfig = {
        method: req.method as "get" | "post" | "put" | "delete" | "patch",
        url: `${originalUrl}${req.url.replace("/itona", "")}`,
        headers: req.headers,
        data: req.body,
        params: req.query,
      };

      const response = await axios(config);
      console.log("Request sent");
      res.send(response.data);
    } else if (req.headers.simulate && req.headers.simulate !== "false") {
      const simulatedRequest = await SimulatedRequestModel.findOne({
        url: request.url,
      });

      if (simulatedRequest) {
        await SimulatedRequestModel.deleteOne({ url: request.url });
      }

      const saveSimulatedRequest = new SimulatedRequestModel({
        method: request.method || "",
        url: request.url,
        bodyResponse: request.body || "",
        timestamp: new Date(),
        httpsAgent: httpsAgent,
      });

      await saveSimulatedRequest.save();

      console.log("Simulated request saved");
      res.send("Simulated request saved");
    } else if (req.headers.simulate === "false") {
      const simulatedRequest = await SimulatedRequestModel.findOne({
        url: request.url,
      });

      if (simulatedRequest) {
        await SimulatedRequestModel.deleteOne({ url: request.url });
        res.send("Simulated request deleted");
      } else {
        console.log("Simulated request not found");
        res.status(400).send("Simulated request not found");
      }
    } else {
      const simulatedRequest = await SimulatedRequestModel.findOne({
        url: request.url,
      });

      if (simulatedRequest) {
        console.log("Simulated request found");
        res.send(simulatedRequest.bodyResponse);
      } else {
        console.log("Request saved");
        res.send("Request saved");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send((error as Error).message || "Internal server error");
  }
});

app.delete("/requests", async (req: Request, res: Response) => {
  console.log("Deleting all requests");
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
