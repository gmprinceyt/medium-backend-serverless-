import { Hono } from "hono";
import userRoute from "./routes/user";
import blogRoute from "./routes/post";
import { HonoEnvAndVar } from "./types";
import { cors } from 'hono/cors'

const app = new Hono<HonoEnvAndVar>();

app.use("/*", cors());
app.route("/api/v1/user", userRoute);
app.route("/api/v1/blog", blogRoute);

export default app;
