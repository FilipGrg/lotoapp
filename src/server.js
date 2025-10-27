import express from "express";
import dotenv from "dotenv";
import { auth } from "express-openid-connect";
import { verifyM2MToken } from "./auth/m2mMiddleware.js";
import publicRoutes from "./routes/public.js";
import ticketsRoutes from "./routes/tickets.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// OpenID Connect za korisnike
app.use(
  auth({
    authRequired: false,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_SECRET,
  })
);

// ✅ Javne i korisničke rute — BEZ M2M tokena
app.use("/", publicRoutes);
app.use("/tickets", ticketsRoutes);

// ✅ Admin rute — SAMO s M2M tokenom
app.use("/", verifyM2MToken, adminRoutes);

// Pokretanje servera
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server radi na portu ${process.env.PORT || 3000}`);
});
