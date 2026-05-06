import {NextRequest} from "next/server";
import { updateSession } from "./app/lib/session";

export async function proxy(request: NextRequest) {
    return await updateSession(request);
}