import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { HTTPException } from "hono/http-exception";
import bcrypt from "bcryptjs";
import { decode, sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// POST /api/v1/user/signup
app.post("/api/v1/user/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { name, email, password } = await c.req.json<{
      name: string | null;
      email: string;
      password: string;
    }>();

    if (!email || !password) {
      throw new HTTPException(411, {
        message: "email, password are required ",
      });
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
app.post("/api/v1/user/signin", async (c) => {
  const prsima = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const {email, password}  = await c.req.json<{email: string, password: string}>();

    if (!email || !password){
      throw new HTTPException(411, {message: "email, password field are required"})
    };

    const user  = await prsima.user.findUnique({
      where: {email}, 
    })

    if (!user ){
      throw new HTTPException(404 , {message: "User not Found"});
    };

    const isMatchPass = await bcrypt.compare(password, user.password);

    if( !isMatchPass) {
      throw new HTTPException(400,{message: "Password Does'nt Matched"});
    };

    const token = await sign({id: user.id, email: user.email}, c.env.JWT_SECRET);
    c.status(200);
    return c.json({
      message: "User login Success",
      token
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new HTTPException(400, { message: error.message });
    } else {
      throw new HTTPException(500, { message: "internal server error" });
    }
  }
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
