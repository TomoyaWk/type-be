import { sign } from "hono/jwt"

const secretKey = "ENV_JWT_SECRET_KEY"

const payload = {
    sub: "test_user",
    exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30min
  };

const generateToken = async() => {return await sign(payload, secretKey)}

export default generateToken;