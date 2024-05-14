import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="simple-bg flex min-h-screen items-center justify-center">
      <SignIn path="/sign-in" />
    </div>
  );
}
