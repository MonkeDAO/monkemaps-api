import dotenv from 'dotenv';
dotenv.config();

export interface JWT{
    JWTSecret: string,
    JWTExpiration: number
}

export default function getJWTSettings(): JWT{
    const secret = process.env.JWTSECRET ?? process.env.APPSETTING_JWTSECRET;
    const expiration = process.env.JWTEXP ?? process.env.APPSETTING_JWTEXP;
    const expirationInt = parseInt(expiration) ?? 36000;
    return {
        JWTExpiration: expirationInt,
        JWTSecret: secret
    };
}