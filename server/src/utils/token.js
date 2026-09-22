const crypto = require("crypto");

const base64url = (value) => Buffer.from(value).toString("base64url");

const sign = (input) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(input).digest("base64url");

const createToken = (payload) => {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })
  );
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
};

const verifyToken = (token) => {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature || !process.env.JWT_SECRET) return null;

  const expected = sign(`${header}.${body}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
};

module.exports = { createToken, verifyToken };
