import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function verifyM2MToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Token nije poslan.');

    const token = authHeader.split(' ')[1];
    const response = await axios.get(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) next();
    else res.status(403).send('Nevažeći token.');
  } catch (err) {
    console.error('Greška pri provjeri tokena:', err.message);
    return res.status(403).send('Nevažeći ili istekao token.');
  }
}
