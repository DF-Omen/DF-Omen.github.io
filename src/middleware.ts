import { defineMiddleware } from "astro:middleware";
import { createServerSupabase } from "./lib/supabase/server";
import { getCurrentUser } from "./lib/auth/user";

import { protectedRoutes, authRoutes, approvalRoutes, adminRoutes, }
	from "./lib/auth/routes";

export const onRequest = defineMiddleware(async (context, next) => {

	const auth = await getCurrentUser(context);

	const isProtected = protectedRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isProtected && !auth.isLoggedIn) {
		const next = encodeURIComponent(context.url.pathname);

		return context.redirect(`/login?next=${next}`);
	}


	const isAuthPage = authRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isAuthPage && auth.isLoggedIn) {
		return context.redirect("/");
	}

	
	const isApprovalPage = approvalRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (auth.isLoggedIn && !auth.approved && !isApprovalPage && isProtected) {
		return context.redirect("/pending-approval");
	}


	const isAdminPage = adminRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isAdminPage && !auth.isAdmin) {
		return context.rewrite("/404");
	}

	return next();
});
