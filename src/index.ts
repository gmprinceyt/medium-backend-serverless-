import { Hono } from "hono";

const app = new Hono();

// POST /api/v1/user/signup
app.post("/api/v1/user/signup", (c)=> {
  c.status(200);
  c.json({
    message: "Successfully Signup",
  })
})


// POST /api/v1/user/signin
app.post("/api/v1/user/signin", (c)=> {
  c.status(200);
  c.json({
    message: "Successfully Signin",
  })
});

// POST /api/v1/blog
app.post("/api/v1/blog", (c)=> {
  c.status(200);
  c.json({
    message: "Successfully Created blog ",
  })
})

// PUT /api/v1/blog
app.put("/api/v1/blog", (c) => {
  c.status(201)
   return c.json({
    message: "Successfully blog Updated "
  })
});


// GET /api/v1/blog/bulk
app.get("/api/v1/blog/bulk", (c) => {
  return c.json({
    message: "Successfully blog Bulk "
  })
});

// GET /api/v1/blog/:id
app.get("/api/v1/blog/:id", (c) => {
  return c.json({
    message: "Successfully blog get",
    id: c.req.param()
  });
})


app.get("/", (c)=>{
  return c.json({message: "Hello World"})
})


export default app;