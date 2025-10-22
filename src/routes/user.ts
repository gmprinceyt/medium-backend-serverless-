import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { HTTPException } from "hono/http-exception";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { HonoEnvAndVar } from "../types";
import z from "zod";
import { UserSigninSchema, UserSignupSchema } from "@gmprincedev/blog-common";

const userRoute = new Hono<HonoEnvAndVar>();

// POST /api/v1/user/signup
userRoute.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { success, data } = z.safeParse(UserSignupSchema, await c.req.json());

    if (!success) {
      throw new HTTPException(411, {
        message: "vaildation Error",
      });
    }
    const { email, password, name } = data;

    const isUserExist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (isUserExist) {
      throw new HTTPException(400, { message: "user already exist" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPass,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const token = await sign(user, c.env.JWT_SECRET);
    c.status(201);
    return c.json({
      message: "User Create Successfully ",
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(500, { message: error.message });
    } else {
      throw new HTTPException(500, { message: "internal server error" });
    }
  }
});

// POST /api/v1/user/signin
userRoute.post("/signin", async (c) => {
  const prsima = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { success, data } = z.safeParse(UserSigninSchema, await c.req.json());

    if (!success) {
      throw new HTTPException(411, {
        message: "email, password field are required",
      });
    }
    const { email, password } = data;
    const user = await prsima.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not Found" });
    }

    const isMatchPass = await bcrypt.compare(password, user.password);

    if (!isMatchPass) {
      throw new HTTPException(400, { message: "Password Does'nt Matched" });
    }

    const token = await sign(
      { id: user.id, email: user.email },
      c.env.JWT_SECRET
    );
    c.status(200);
    return c.json({
      message: "User login Success",
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(400, { message: error.message });
    } else {
      throw new HTTPException(500, { message: "internal server error" });
    }
  }
});

export default userRoute;
