import { createServerClient } from "@supabase/ssr";
import type { APIContext } from "astro";

export function createServerSupabase(context: APIContext) {
	return createServerClient(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(name) {
					return context.cookies.get(name)?.value;
				},
				set(name, value, options) {
					context.cookies.set(name, value, options);
				},
				remove(name, options) {
					context.cookies.delete(name, options);
				},
			},
		}
	);
}
