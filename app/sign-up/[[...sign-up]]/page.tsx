import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="simple-bg flex min-h-screen items-center justify-center">
      <SignUp path="/sign-up" />
    </div>
  );
}
