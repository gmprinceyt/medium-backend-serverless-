import { Hono } from "hono";
import userRoute from "./routes/user";
import blogRoute from "./routes/post";
import { HonoEnvAndVar } from "./types";

const app = new Hono<HonoEnvAndVar>();

app.route("/api/v1/user", userRoute)
app.route("/api/v1/blog", blogRoute)

export default app;
