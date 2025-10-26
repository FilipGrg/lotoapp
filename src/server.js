import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './db.js';
import oidc from './auth/oidc.js';
import publicRoutes from './routes/public.js';
import ticketRoutes from './routes/tickets.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(oidc);
app.use('/', publicRoutes);
app.use('/', ticketRoutes);
app.use('/', adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server radi na portu ${port}`));
