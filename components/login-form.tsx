"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import Link from "next/link";
import { Divider } from "@/components/ui/divider";
import { Card, CardContent } from "@/components/ui/card";

function GitHubSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4 mr-2"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const formSchema = z.object({
  email: z.string().min(1, { message: "Enter an email" }),
  password: z.string().min(1, { message: "Enter a password" })
});

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function completeLogin(email: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("echodeck_user", email || "streamer@twitch.tv");
      window.dispatchEvent(new Event("storage"));
    }
    router.push("/");
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    completeLogin(values.email);
  }

  function handleQuickLogin() {
    completeLogin("streamer@twitch.tv");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1080')] bg-cover bg-center bg-no-repeat lg:grid-cols-2">
      <Card className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 border-0 shadow-none bg-background/95 backdrop-blur-md p-6 rounded-2xl">
        <CardContent className="space-y-8 text-center w-full p-0">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center">
            <img src="/logo-no-bg.png" className="size-10 object-contain" alt="EchoDeck Logo" />
            <h1 className="font-heading text-center text-3xl font-semibold">Sign in to your account</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="streamer@twitch.tv" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      Password{" "}
                      <Link href="#" className="text-muted-foreground text-sm underline">
                        Forgot password?
                      </Link>
                    </FormLabel>

                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign in
              </Button>

              <p className="text-muted-foreground text-sm">
                Not a member?{" "}
                <Link href="#" className="underline">
                  Start a 14 day free trial
                </Link>
              </p>
            </form>
          </Form>

          <Divider>or continue with</Divider>

          <div className="mt-6 flex w-full flex-col gap-3">
            <Button variant="outline" type="button" onClick={handleQuickLogin}>
              <GitHubSvg />
              <span className="sr-only">GitHub</span>
              Continue with GitHub
            </Button>
            <Button variant="outline" type="button" onClick={handleQuickLogin}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 mr-2">
                <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"></path>
              </svg>
              <span className="sr-only">Google</span>
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
