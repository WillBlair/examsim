"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Social } from "@/components/auth/social";
import { register } from "@/app/actions/auth";
import { ArrowRight } from "@phosphor-icons/react";

const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  // Removed name from schema or made it optional since UI won't show it
  name: z.string().optional(), 
});

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const handleEmailFocus = () => {
      if (!showPassword) {
          setShowPassword(true);
      }
  };

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    if (!showPassword) return;

    startTransition(() => {
      // Default name since we removed the field
      const safeValues = {
          ...values,
          name: "Student" 
      };

      register(safeValues as any)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
          }
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Login to existing account"
      backButtonHref="/login"
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
                  onFocus={handleEmailFocus}
                  className="h-10 rounded-lg bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 transition-all text-sm"
                />
               {form.formState.errors.email && (
                  <p className="text-xs font-medium text-red-500 ml-1">{form.formState.errors.email.message}</p>
               )}
            </div>

            {showPassword && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid gap-1.5">
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
                </div>
            )}
          </div>
          
          {error && (
             <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-x-2 text-sm text-red-600 font-medium">
                <p>{error}</p>
             </div>
          )}
          
          {success && (
             <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-x-2 text-sm text-emerald-600 font-medium">
                <p>{success}</p>
             </div>
          )}
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-10 rounded-full bg-brand-orange text-white hover:bg-orange-600 font-bold text-sm shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Create an account
            <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
};
