import { auth } from "~/lib/auth";
 
// Catch-all route for Better Auth - handles all auth-related API endpoints
export default defineEventHandler((event) => {
    return auth.handler(toWebRequest(event));
});
