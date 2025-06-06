import { SignUpForm } from "@/components/sign-up-form";
import { Navbar } from "@/components/navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthButton={false} />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center pt-16 p-6 md:p-10">
        <div className="w-full max-w-md">
        <SignUpForm />
        </div>
      </div>
    </div>
  );
}
