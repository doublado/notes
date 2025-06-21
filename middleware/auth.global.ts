import { authClient } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
	const { data: session } = await authClient.useSession(useFetch);
	
	// If user is authenticated
	if (session.value) {
		// Redirect away from auth pages (except password reset)
		if (to.path.startsWith('/auth')) {
			// Allow access to password reset page even when authenticated
			if (to.path === '/auth/reset' && to.query.token) {
				return; // Allow access to password reset with token
			}
			
			// Redirect to dashboard for all other auth pages
			return navigateTo('/dashboard');
		}
	} else {
		// If user is not authenticated
		if (to.path === "/dashboard") {
			return navigateTo("/auth");
		}
	}
});
