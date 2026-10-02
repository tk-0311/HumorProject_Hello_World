import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AccountMenu from "./AccountMenu";

const navigationItems = [
	// { label: "Top 100", href: "/", active: true },
	{ label: "Favorites", href: "/favorite", active: false },
	// { label: "Images", href: "/images", active: false },
];


function BrandLink({ inverse = false }: { inverse?: boolean }) {
	return (
		<Link href="/" aria-label="Humor Project home" className={`font-serif text-[30px] font-bold leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00] sm:text-[34px] ${inverse ? "text-white" : "text-[var(--foreground)]"}`}>
			Humor Project
		</Link>
	);
}

function SignedOutNavBar() {
	return (
		<header className="min-h-[112px] border-b border-white/10 bg-[#0c0a09] text-[#aaa6a3] sm:min-h-[148px]">
			<div className="mx-auto flex min-h-[112px] w-full items-center justify-between gap-5 px-5 sm:min-h-[148px] sm:px-8 lg:px-[72px]">
				<BrandLink inverse />
				<div className="flex items-center gap-3 sm:gap-5">
					<div aria-label="Theme preference" className="hidden h-[70px] items-center gap-1 border border-white/15 p-1 sm:flex">
						<span aria-label="Light theme" className="flex h-14 w-14 items-center justify-center">
							<svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
								<circle cx="12" cy="12" r="3.5" />
								<path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
							</svg>
						</span>
						<span aria-label="Dark theme" className="flex h-14 w-14 items-center justify-center">
							<svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
								<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
							</svg>
						</span>
						<span aria-label="System theme selected" aria-current="true" className="flex h-14 w-14 items-center justify-center bg-white/10 text-[#ffda00]">
							<svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
								<rect x="3" y="4" width="18" height="13" rx="1.5" />
								<path d="M8 21h8m-4-4v4" />
							</svg>
						</span>
					</div>
					<Link href="/login" className="flex h-[58px] items-center border border-white/15 px-4 text-lg font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00] sm:px-6 sm:text-[28px]">
						Login
					</Link>
					<Link href="/signup" className="flex h-[58px] items-center bg-[#ffda00] px-4 text-lg font-semibold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 sm:text-[28px]">
						Sign up
					</Link>
				</div>
			</div>
		</header>
	);
}

function SignedInNavBar({ name, email }: { name: string; email: string }) {
	console.log("SignedInNavBar props:", { name, email }); // Debugging line
	return (
		<header className="relative z-40 min-h-[112px] overflow-visible border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)] sm:min-h-[148px] lg:min-h-[198px]">
			<div className="mx-auto flex min-h-[112px] max-w-[1600px] flex-wrap items-center justify-between gap-x-10 gap-y-3 overflow-visible px-5 py-5 sm:min-h-[148px] sm:flex-nowrap sm:px-8 lg:min-h-[198px] lg:px-[72px]">
				<div className="flex w-full shrink-0 items-center justify-between gap-8 sm:w-auto sm:justify-start sm:gap-[76px]">
					<BrandLink />
					{/* creating new post needs functionality */}
						<Link href="/new" className="text-xl font-semibold transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00] sm:text-[30px]">
						New
					</Link>
				</div>

				<div className="relative flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-5 lg:gap-7">
					<nav aria-label="Main navigation" className="flex min-w-0 items-center justify-between gap-4 whitespace-nowrap sm:gap-8 lg:gap-9">
						{navigationItems.map(({ label, href, active }) => (
							<Link
								key={label}
								href={href}
								aria-current={active ? "page" : undefined}
								className={`shrink-0 text-lg font-semibold transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00] sm:text-2xl lg:text-[34px] ${active ? "text-[#d1a900]" : "text-[var(--muted)]"}`}
							>
								{label}
							</Link>
						))}
					</nav>
					<AccountMenu name={name} email={email} />
				</div>
			</div>
		</header>
	);
}

export default async function NavBar() {
	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);
	const { data: { user } } = await supabase.auth.getUser();

	const metadata = user?.user_metadata ?? {};
	const name = typeof metadata.full_name === "string"
		? metadata.full_name
		: typeof metadata.name === "string"
			? metadata.name
			: user?.email?.split("@")[0] ?? "Account";

	return user
		? <SignedInNavBar name={name} email={user.email ?? ""} />
		: <SignedOutNavBar />;
}
