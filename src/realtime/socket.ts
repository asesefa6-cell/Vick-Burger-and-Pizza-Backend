import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { models } from "../db";
import { JwtPayload } from "../types/auth";
import { ClientToServerEvents, ServerToClientEvents } from "./events";

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null =
  null;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const initSocket = (
  server: HttpServer,
): SocketIOServer<ClientToServerEvents, ServerToClientEvents> => {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const authHeader = socket.handshake.auth?.token as string | undefined;
    if (!authHeader) return next();

    try {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;
      const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
      socket.data.user = payload;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as JwtPayload | undefined;

    if (user?.businessId) {
      if (
        user.role === "Chef" ||
        user.role === "Waiter" ||
        user.role === "Admin" ||
        user.role === "Manager"
      ) {
        socket.join(`staff:${user.businessId}`);
      }
      if (user.role === "Chef" || user.role === "Waiter") {
        socket.join(`kitchen:${user.businessId}`);
      }
      if (user.role === "Admin" || user.role === "Manager") {
        socket.join(`admin:${user.businessId}`);
      }
    }

    if (user?.role === "Super Admin") {
      socket.join("admin:global");
    }

    socket.on("join-kitchen", () => {
      if (
        user?.businessId &&
        (user.role === "Chef" ||
          user.role === "Waiter" ||
          user.role === "Admin" ||
          user.role === "Manager")
      ) {
        socket.join(`kitchen:${user.businessId}`);
      }
    });

    socket.on("join-staff", () => {
      if (
        user?.businessId &&
        (user.role === "Chef" ||
          user.role === "Waiter" ||
          user.role === "Admin" ||
          user.role === "Manager")
      ) {
        socket.join(`staff:${user.businessId}`);
      }
    });

    socket.on("join-admin", () => {
      if (
        user?.businessId &&
        (user.role === "Admin" || user.role === "Manager")
      ) {
        socket.join(`admin:${user.businessId}`);
      }
      if (user?.role === "Super Admin") {
        socket.join("admin:global");
      }
    });

    socket.on("join-table", async ({ tableId, qrCode }) => {
      console.log(`[Socket] Attempting join-table: ${tableId}`);
      const table = await models.Table.findByPk(tableId);
      if (!table) {
        console.log(`[Socket] Table not found: ${tableId}`);
        return;
      }
      if (table.qrCode !== qrCode) {
        console.log(`[Socket] QR Code mismatch for table: ${tableId}`);
        return;
      }
      socket.join(`table:${tableId}`);
      console.log(`[Socket] Client joined room: table:${tableId}`);
    });
  });

  return io;
};

export const getSocket = (): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
