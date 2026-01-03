import { NewLoginForm } from "@/components/auth/new-login-form";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-800 animate-spin" />
      </div>
    }>
      <NewLoginForm />
    </Suspense>
  );
}

export default LoginPage;
