import express from "express";
import { ENV } from "./config/env";
import { clerkMiddleware } from '@clerk/express'
import cors from "cors";

const app = express();

app.use(clerkMiddleware());
app.use(cors({origin:ENV.FRONTEND_URL}))
app.get("/", (req, res) => {
  const {} = req.body;
    res.json({
    message: "Welcome to Productify API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
    },
  });
})
app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT))