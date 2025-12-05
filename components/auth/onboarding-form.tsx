"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
// Removing next-auth/react signOut to use server action
import { logout } from "@/app/actions/auth"; 

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/app/actions/onboarding";
import { SignOut } from "@phosphor-icons/react";

// Defining subjects manually for now
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "English Literature",
  "Computer Science",
];

const GRADES = [
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "College Freshman",
    "College Sophomore",
    "College Junior",
    "College Senior",
];

const OnboardingSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  grade: z.string().min(1, {
    message: "Grade is required.",
  }),
  subjects: z.array(z.string()).min(1, {
    message: "Please select at least one subject.",
  }),
});

export const OnboardingForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      username: "",
      grade: "",
      subjects: [],
    },
  });

  const onSubmit = (values: z.infer<typeof OnboardingSchema>) => {
    setError("");

    startTransition(() => {
      completeOnboarding(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
             // Force reload to update session
             window.location.assign("/dashboard");
          }
        });
    });
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
      const currentSubjects = form.getValues("subjects");
      if (checked) {
          form.setValue("subjects", [...currentSubjects, subject]);
      } else {
          form.setValue("subjects", currentSubjects.filter((s) => s !== subject));
      }
  };

  return (
    <Card className="w-[600px] shadow-md bg-white">
      <CardHeader>
        <div className="w-full flex flex-col gap-y-4 items-center justify-center relative">
           {/* Sign Out Button for stuck users */}
           <form action={() => logout()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 text-muted-foreground hover:text-red-500"
                type="submit"
              >
                Sign Out
              </Button>
           </form>

          <h1 className="text-3xl font-semibold">
            Setup your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Tell us a bit about yourself to personalize your experience.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
             <div className="grid gap-2">
               <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
               <Input
                  {...form.register("username")}
                  disabled={isPending}
                  placeholder="studymaster99"
                />
               {form.formState.errors.username && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.username.message}</p>
               )}
            </div>
            
            <div className="grid gap-2">
               <label htmlFor="grade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Current Grade / Level</label>
               <select 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 {...form.register("grade")}
                 disabled={isPending}
               >
                  <option value="" disabled>Select your grade</option>
                  {GRADES.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                  ))}
               </select>
               {form.formState.errors.grade && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.grade.message}</p>
               )}
            </div>

            <div className="grid gap-2">
               <label className="text-sm font-medium leading-none">Subjects of Interest</label>
               <div className="grid grid-cols-2 gap-2 mt-2">
                   {SUBJECTS.map((subject) => (
                       <div key={subject} className="flex items-center space-x-2">
                           <input 
                                type="checkbox" 
                                id={subject}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                disabled={isPending}
                                onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                           />
                           <label htmlFor={subject} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                               {subject}
                           </label>
                       </div>
                   ))}
               </div>
               {form.formState.errors.subjects && (
                  <p className="text-sm font-medium text-red-500">{form.formState.errors.subjects.message}</p>
               )}
            </div>
          </div>
          
          {error && (
             <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-500">
                <p>{error}</p>
             </div>
          )}
          
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            Complete Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
