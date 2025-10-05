import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { HTTPException } from "hono/http-exception";
import { HonoEnvAndVar } from "../types";
import z from "zod";
import { BlogCreateSchema } from "../zod";
import { verify } from "hono/jwt";

const blogRoute = new Hono<HonoEnvAndVar>();

// middleware for Authorization
blogRoute.use("/*", async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: "Authorization header not provided!",
    });
  }
  try {
    const token = header.split(" ")[1];
    const isVerifyToken = await verify(token, c.env.JWT_SECRET);

    if (isVerifyToken) {
      c.set("userId", isVerifyToken.id as string);
      await next();
    } else {
      throw new HTTPException(401, { message: "unauthorized token" });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(401, { message: "unauthorized" });
    }
  }
});

// POST /api/v1/blog
// Create a Blog
blogRoute.post("/", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { success, data } = z.safeParse(BlogCreateSchema, await c.req.json());

    if (!success) {
      throw new HTTPException(411, {
        message: "title or Content Fields Requuire",
      });
    }
    const { title, content } = data;
    const authorId = c.get("userId");
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
      select: {
        id: true,
        authorId: true
      },
    });
    c.status(201);
    return c.json({
      message: "Post Created Successfully",
      post,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new HTTPException(500, { message: e.message });
    }
  }
});

// PUT /api/v1/blog
blogRoute.put("/api/v1/blog", (c) => {
  c.status(201);
  return c.json({
    message: "Successfully blog Updated ",
  });
});

// GET /api/v1/blog/bulk
blogRoute.get("/api/v1/blog/bulk", (c) => {
  return c.json({
    message: "Successfully blog Bulk ",
  });
});

// GET /api/v1/blog/:id
blogRoute.get("/api/v1/blog/:id", (c) => {
  return c.json({
    message: "Successfully blog get",
    id: c.req.param(),
  });
});

blogRoute.get("/", (c) => {
  return c.json({ message: "Hello World" });
});

export default blogRoute;
