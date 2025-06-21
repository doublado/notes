import { authClient } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
	const { data: session } = await authClient.useSession(useFetch);
	
	if (session.value) {
		// Redirect authenticated users away from auth pages
		if (to.path.startsWith('/auth')) {
			// Allow password reset even when authenticated - users might want to change password
			if (to.path === '/auth/reset' && to.query.token) {
				return;
			}
			
			return navigateTo('/dashboard');
		}
	} else {
		// Protect dashboard from unauthenticated access
		if (to.path === "/dashboard") {
			return navigateTo("/auth");
		}
	}
});
