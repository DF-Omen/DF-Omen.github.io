import { defineMiddleware } from "astro:middleware";
import { createServerSupabase } from "./lib/supabase/server";

import { protectedRoutes, authRoutes, approvalRoutes, adminRoutes, }
	from "./lib/auth/routes";

export const onRequest = defineMiddleware(async (context, next) => {
	const supabase = createServerSupabase(context);

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	let approved = false;
	let isAdmin = false;

	if (user) {
		const { data: profile, error } = await supabase
			.from("profiles")
			.select("approved, is_admin")
			.eq("id", user.id)
			.single();

			if (!error && profile) {
				approved = profile.approved;
				isAdmin = profile.is_admin;
			}
		}

	const isProtected = protectedRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isProtected && !user) {
		const next = encodeURIComponent(context.url.pathname);

		return context.redirect(`/login?next=${next}`);
	}


	const isAuthPage = authRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isAuthPage && user) {
		return context.redirect("/");
	}

	
	const isApprovalPage = approvalRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (user && !approved && !isApprovalPage && isProtected) {
		return context.redirect("/pending-approval");
	}


	const isAdminPage = adminRoutes.some(route =>
		context.url.pathname.startsWith(route)
	);

	if (isAdminPage && !isAdmin) {
		context.rewrite("/404");
	}

	return next();
});
