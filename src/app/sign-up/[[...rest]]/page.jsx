import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in"  />
    </div>
  );
}
