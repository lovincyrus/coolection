import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="dots flex min-h-screen items-center justify-center">
      <SignIn path="/sign-in" />
    </div>
  );
}
