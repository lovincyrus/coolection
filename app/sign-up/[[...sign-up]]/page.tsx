import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="dots flex min-h-screen items-center justify-center">
      <SignUp path="/sign-up" />
    </div>
  );
}
