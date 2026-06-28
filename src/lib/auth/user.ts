import type { APIContext } from "astro";
import { createServerSupabase } from "../supabase/server";

export async function getCurrentUser (context: APIContext) {
		const supabase =
			createServerSupabase(context);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return {
				isLoggedIn: false,
				user: null,
				approved: false,
				isAdmin: false,
			};
		}

		const { data: profile } =
			await supabase
				.from("profiles")
				.select("approved, is_admin")
				.eq("id", user.id)
				.maybeSingle();

		return {
			isLoggedIn: true,
			user,
			approved: profile?.approved ?? false,
			isAdmin: profile?.is_admin ?? false,
		};
}
