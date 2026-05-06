import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { models } from "../db";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { JwtPayload } from "../types/auth";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
  businessId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const registerUser = async (input: RegisterInput): Promise<User> => {
  const existing = await models.User.findOne({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return await models.User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    roleId: input.roleId,
    businessId: input.businessId ?? null,
  });
};

const resolveBusinessForUser = async (
  userId: string,
  businessId?: string | null,
) => {
  if (businessId) return businessId;
  const link = await models.UserBusiness.findOne({ where: { userId } });
  return link?.businessId ?? null;
};

export const loginUser = async (
  input: LoginInput,
): Promise<{
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId?: string | null;
    businessIds?: string[];
    businesses?: { id: string; businessName: string }[];
    business?: { id: string; businessName: string } | null;
    profileFileId?: string | null;
  };
}> => {
  const user = await models.User.findOne({
    where: { email: input.email },
    include: [{ model: Role }],
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const roleName = user.role?.roleName || "Waiter";
  const resolvedBusinessId = await resolveBusinessForUser(
    user.id,
    user.businessId,
  );

  if (roleName !== "Super Admin" && resolvedBusinessId) {
    const biz = await models.Business.findByPk(resolvedBusinessId);
    if (biz && !biz.isActive) {
      throw new Error(
        "Your establishment is currently disabled. Please contact the administrator.",
      );
    }
  }

  const payload: JwtPayload = {
    userId: user.id,
    role: roleName as JwtPayload["role"],
    businessId: resolvedBusinessId ?? null,
  };

  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

  let businessIds: string[] | undefined = undefined;
  let businesses: { id: string; businessName: string }[] | undefined =
    undefined;
  let business: { id: string; businessName: string } | null = null;

  if (roleName === "Super Admin") {
    const links = await models.UserBusiness.findAll({
      where: { userId: user.id },
    });
    businessIds = links.map((l) => l.businessId);
    if (businessIds.length > 0) {
      const rows = await models.Business.findAll({
        where: { id: businessIds },
      });
      businesses = rows.map((b) => ({
        id: b.id,
        businessName: b.businessName,
      }));
    } else {
      businesses = [];
    }
  } else if (resolvedBusinessId) {
    const row = await models.Business.findByPk(resolvedBusinessId);
    if (row) business = { id: row.id, businessName: row.businessName };
  }

  const userPayload: {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId?: string | null;
    businessIds?: string[];
    businesses?: { id: string; businessName: string }[];
    business?: { id: string; businessName: string } | null;
    profileFileId?: string | null;
  } = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleName,
    businessId: resolvedBusinessId ?? null,
    business: business ?? null,
    profileFileId: user.profileFileId ?? null,
  };
  if (businessIds !== undefined) userPayload.businessIds = businessIds;
  if (businesses !== undefined) userPayload.businesses = businesses;

  return {
    token,
    user: userPayload,
  };
};

export const getMe = async (
  userId: string,
): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string | null;
  businessIds?: string[];
  businesses?: { id: string; businessName: string }[];
  business?: { id: string; businessName: string } | null;
  profileFileId?: string | null;
} | null> => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: Role }],
  });
  if (!user) return null;

  const roleName = user.role?.roleName || "Waiter";
  const resolvedBusinessId = await resolveBusinessForUser(
    user.id,
    user.businessId,
  );

  if (roleName !== "Super Admin" && resolvedBusinessId) {
    const biz = await models.Business.findByPk(resolvedBusinessId);
    if (biz && !biz.isActive) {
      return null; // Block session restoration if business is disabled
    }
  }

  let businessIds: string[] | undefined = undefined;
  let businesses: { id: string; businessName: string }[] | undefined =
    undefined;
  let business: { id: string; businessName: string } | null = null;

  if (roleName === "Super Admin") {
    const links = await models.UserBusiness.findAll({
      where: { userId: user.id },
    });
    businessIds = links.map((l) => l.businessId);
    if (businessIds.length > 0) {
      const rows = await models.Business.findAll({
        where: { id: businessIds },
      });
      businesses = rows.map((b) => ({
        id: b.id,
        businessName: b.businessName,
      }));
    } else {
      businesses = [];
    }
  } else if (resolvedBusinessId) {
    const row = await models.Business.findByPk(resolvedBusinessId);
    if (row) business = { id: row.id, businessName: row.businessName };
  }

  const payload: {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId?: string | null;
    businessIds?: string[];
    businesses?: { id: string; businessName: string }[];
    business?: { id: string; businessName: string } | null;
    profileFileId?: string | null;
  } = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleName,
    businessId: resolvedBusinessId ?? null,
    business: business ?? null,
    profileFileId: user.profileFileId ?? null,
  };
  if (businessIds !== undefined) payload.businessIds = businessIds;
  if (businesses !== undefined) payload.businesses = businesses;

  return payload;
};

export const updateMe = async (
  userId: string,
  updates: { name?: string; profileFileId?: string | null },
): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string | null;
  businessIds?: string[];
  businesses?: { id: string; businessName: string }[];
  business?: { id: string; businessName: string } | null;
  profileFileId?: string | null;
} | null> => {
  const user = await models.User.findByPk(userId, {
    include: [{ model: Role }],
  });
  if (!user) return null;

  await user.update({
    ...(updates.name ? { name: updates.name } : {}),
    ...(updates.profileFileId !== undefined
      ? { profileFileId: updates.profileFileId }
      : {}),
  });

  return await getMe(userId);
};
