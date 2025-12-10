"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Social } from "@/components/auth/social";
import { login } from "@/app/actions/auth";
import { ArrowRight } from "@phosphor-icons/react";

const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = form.watch("email");

  // Show password fields when user starts typing email
  if (emailValue && emailValue.length > 0 && !showPassword) {
      setShowPassword(true);
  }

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    if (!showPassword) return;

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }
          // Success is handled by redirect in server action or middleware
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Create an account"
      backButtonHref="/register"
      showSocial
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
           <Social />
           <div className="relative py-0">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-white px-3 text-zinc-400">
                    Or
                    </span>
                </div>
            </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <div className="grid gap-1.5">
               <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 ml-1">Email</label>
               <Input
                  {...form.register("email")}
                  disabled={isPending}
                  placeholder="john.doe@example.com"
                  type="email"
                  className="h-10 rounded-lg bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 transition-all text-sm"
                />
               {form.formState.errors.email && (
                  <p className="text-xs font-medium text-red-500 ml-1">{form.formState.errors.email.message}</p>
               )}
            </div>
            
            {showPassword && (
                <div className="grid gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 ml-1">Password</label>
                    <Input
                        {...form.register("password")}
                        disabled={isPending}
                        placeholder="******"
                        type="password"
                        className="h-10 rounded-lg bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 transition-all text-sm"
                        />
                    {form.formState.errors.password && (
                        <p className="text-xs font-medium text-red-500 ml-1">{form.formState.errors.password.message}</p>
                    )}
                </div>
            )}
          </div>
          
          {error && (
             <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-x-2 text-sm text-red-600 font-medium">
                <p>{error}</p>
             </div>
          )}
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-10 rounded-full bg-brand-orange text-white hover:bg-emerald-600 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Login
            <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
};
