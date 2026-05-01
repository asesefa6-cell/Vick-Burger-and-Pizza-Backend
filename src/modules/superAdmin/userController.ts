import { Request, Response, NextFunction } from "express";
import {
  createUser,
  deleteUser,
  listUsers,
  assignBusinessesToUser,
  updateUser,
  listAssignments,
} from "./userService";
import { parseIdParam } from "../_shared/validation";
import { models } from "../../db";

export const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await createUser(req.body);
    res
      .status(201)
      .json({ success: true, message: "User created", data: user });
  } catch (error) {
    next(error);
  }
};

export const listUsersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await listUsers();
    res
      .status(200)
      .json({ success: true, message: "Users fetched", data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }
    const user = await updateUser(id, req.body);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "User updated", data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }
    const deleted = await deleteUser(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

export const assignBusinessesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }
    const businessIds = req.body.businessIds as string[];
    await assignBusinessesToUser(id, businessIds);
    res.status(200).json({ success: true, message: "Businesses assigned" });
  } catch (error) {
    next(error);
  }
};

export const getUserBusinessesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }
    const assignments = await models.UserBusiness.findAll({
      where: { userId: id },
      include: [{ model: models.Business, as: "business" }],
    });
    const businesses = assignments.map((a: any) => a.business);
    res.status(200).json({
      success: true,
      message: "User businesses fetched",
      data: businesses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseIdParam(req);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }
    const deletedCount = await models.UserBusiness.destroy({ where: { id } });
    if (deletedCount === 0) {
      res.status(404).json({ success: false, message: "Assignment not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    next(error);
  }
};

export const listAssignmentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit || 10)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const { rows, count } = await listAssignments({
      ...(q ? { q } : {}),
      limit,
      offset,
    });
    res.status(200).json({
      success: true,
      message: "Assignments fetched",
      data: rows,
      meta: { count, limit, offset },
    });
  } catch (error) {
    next(error);
  }
};
