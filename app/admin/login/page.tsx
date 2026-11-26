import { login } from "../actions";
import { authProblems, usingDemoLogins } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const problems = authProblems();
  return (
    <div className="grid min-h-screen place-items-center bg-[#24160f] px-5">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-[2rem] bg-ivory p-9">
        <p className="serif text-3xl italic">Studio portal</p>
        <p className="text-sm opacity-60">Sign in to manage your store.</p>
        {problems.length > 0 && (
          <p className="rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">The portal is not set up yet. Add these environment variables in Vercel, then redeploy: {problems.join(", ")}.</p>
        )}
        {usingDemoLogins() && <p className="rounded-xl bg-gold/15 p-3 text-xs">Local development: sign in with admin@demo.com / admin123. Demo logins never work on the live site.</p>}
        {error && <p className="text-sm text-burgundy">Incorrect email or password.</p>}
        <input name="email" type="email" placeholder="Email" className="field" required autoFocus />
        <input name="password" type="password" placeholder="Password" className="field" required />
        <button className="btn btn-dark w-full">Sign in</button>
      </form>
    </div>
  );
}
