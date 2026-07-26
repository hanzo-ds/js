import jwt from "jsonwebtoken";

export function makeJWT(): string {
  const secret = process.env["DATASTORE_CLOUD_JWT_SECRET"];
  if (secret === undefined) {
    throw new Error(
      "Environment variable DATASTORE_CLOUD_JWT_SECRET is not set",
    );
  }
  const payload = {
    iss: "Datastore",
    sub: "CI_Test",
    aud: "1f7f78b8-da67-480b-8913-726fdd31d2fc",
    "datastore:roles": ["default"],
    "datastore:grants": [],
  };
  return jwt.sign(payload, secret, { expiresIn: "15m", algorithm: "RS256" });
}
