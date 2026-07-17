import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="shell min-h-[76vh] py-14 lg:py-20">
      <LoginForm initialMessage={error ?? ""} />
    </main>
  );
}
