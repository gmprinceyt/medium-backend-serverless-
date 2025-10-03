import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

// POST /api/v1/user/signup
app.post("/api/v1/user/signup", async (c) => {
  
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const user  = await prisma.user.create({
      data: {
        name: "Vikash kumar",
        email: "Vikash@gmail.com",
        password: "PRINCE123"
      }
    })
    c.status(200);
    return c.json(user)
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(500, { message: error.message });
    } else {
      throw new HTTPException(500, { message: "internal server error" });
    }
  }
});

// POST /api/v1/user/signin
app.post("/api/v1/user/signin", (c) => {
  c.status(200);
  c.json({
    message: "Successfully Signin",
  });
});

// POST /api/v1/blog
app.post("/api/v1/blog", (c) => {
  c.status(200);
  c.json({
    message: "Successfully Created blog ",
  });
});

// PUT /api/v1/blog
app.put("/api/v1/blog", (c) => {
  c.status(201);
  return c.json({
    message: "Successfully blog Updated ",
  });
});

// GET /api/v1/blog/bulk
app.get("/api/v1/blog/bulk", (c) => {
  return c.json({
    message: "Successfully blog Bulk ",
  });
});

// GET /api/v1/blog/:id
app.get("/api/v1/blog/:id", (c) => {
  return c.json({
    message: "Successfully blog get",
    id: c.req.param(),
  });
});

app.get("/", (c) => {
  return c.json({ message: "Hello World" });
});

export default app;
