import 'server-only'
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
    userId: number;
    username?: string;
    expiresAt: Date;
}

export async function encrypt(payload: any){
    return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(encodedKey);
}

export async function decrypt(session: string): Promise<SessionPayload> {
    try {
    const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
    });
    return payload as SessionPayload; 
    } catch (error) {
        console.error("Error decrypting session:", error);
        throw new Error("INVALID_SESSION");
    }  
}

export async function createSession(userId: number, username?: string) {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const session = await encrypt({userId, username, expiresAt});
    const cookieStore = await cookies();
    cookieStore.set('userSession', session, {
        httpOnly: true,
        secure:true,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt
    })
}

export async function getSession(){
    const cookieStore = await cookies();
    const session = cookieStore.get('userSession')?.value;
    if(!session) return null;
    return await decrypt(session);
}

export async function updateSession(request:NextRequest) {
    const session = request.cookies.get('userSession')?.value;
    if(!session) return;
    //refresh session expiration so it doesnt expire while user is active
    const parse = await decrypt(session);
    parse.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'userSession',
        value: await encrypt(parse),
        httpOnly: true,
        secure:true,
        sameSite: 'lax',
        path: '/',
        expires: parse.expiresAt
    });
    return res;
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('userSession');
}