import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";
dotenv.config();


const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
});


function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}


export function verifyM2MToken(req, res, next) {
  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${process.env.AUTH0_ISSUER_BASE_URL}/`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("Neispravan M2M token:", err.message);
        return res.status(403).send("Neispravan token");
      }

   
      req.auth = decoded;
      next();
    }
  );
}
