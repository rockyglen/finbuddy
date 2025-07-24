import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
