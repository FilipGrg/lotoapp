import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import { verifyM2MToken } from "./auth/m2mMiddleware.js";
import publicRoutes from "./routes/public.js";
import ticketsRoutes from "./routes/tickets.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(
  auth({
    authRequired: false,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_SECRET,
  })
);

// ✅ Korisničke rute (bez M2M tokena)
app.use("/", publicRoutes);
app.use("/tickets", ticketsRoutes);

// ✅ Admin rute (s M2M tokenom)
app.use("/", verifyM2MToken, adminRoutes);

app.listen(3000, () => console.log("Server radi na portu 3000"));
