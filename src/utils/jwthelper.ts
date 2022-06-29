import dotenv from 'dotenv';
dotenv.config();

export interface JWT{
    JWTSecret: string,
    JWTExpiration: number
}

export default function getJWTSettings(): JWT{
    const secret = process.env.JWTSECRET ?? process.env.APPSETTING_JWTSECRET;
    const expiration = 720;
    return {
        JWTExpiration: expiration,
        JWTSecret: secret
    };
}