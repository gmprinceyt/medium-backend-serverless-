import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { HTTPException } from "hono/http-exception";
import { HonoEnvAndVar } from "../types";
import z from "zod";
import { BlogCreateSchema } from "@gmprincedev/blog-common";
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

// POST
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
        authorId: true,
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
blogRoute.put("/:id", async (c) => {
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
    const id = c.req.param("id");
    const authorId = c.get("userId");
    const post = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        authorId,
      },
      select: {
        id: true,
      },
    });
    c.status(200);
    return c.json({
      message: "Successfully blog Updated ",
      post,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new HTTPException(500, { message: e.message });
    }
  }
});

// GET /api/v1/blog/bulk
blogRoute.get("/bulk", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const page = c.req.query("page");
    const skip = Number(page) * 10 || 0;

    const blogs = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: 10,
    });
    return c.json({
      message: "Success",
      blogs,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(500, {
        message: error.message || "Internal Server Error",
      });
    }
  }
});

// GET /api/v1/blog/:id
blogRoute.get("/:id", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const id = c.req.param("id");
    const blog = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) throw new HTTPException(500, { message: "blog Not Found!" });
    return c.json({
      message: "success. get single blog ",
      blog,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(500, {
        message: error.message || "Internal Server Error",
      });
    }
  }
});

export default blogRoute;
