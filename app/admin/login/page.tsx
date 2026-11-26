import { login } from "../actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-[#24160f] px-5">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-[2rem] bg-ivory p-9">
        <p className="serif text-3xl italic">Studio portal</p>
        <p className="text-sm opacity-60">Sign in to manage your store.</p>
        {error && <p className="text-sm text-burgundy">Incorrect email or password.</p>}
        <input name="email" type="email" placeholder="Email" className="field" required autoFocus />
        <input name="password" type="password" placeholder="Password" className="field" required />
        <button className="btn btn-dark w-full">Sign in</button>
      </form>
    </div>
  );
}
