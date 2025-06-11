"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      const errorMsg = "密码不匹配";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });
      
      // 调试信息：检查返回数据
      console.log('注册响应:', { error, data });
      
      if (error) throw error;
      
      // 显示成功提示
      toast.success('注册成功！请检查您的邮箱以验证账户', {
        duration: 3000,
      });
      
      // 短暂延迟后跳转
      setTimeout(() => {
        router.push("/sign-up-success");
        // 不在这里结束加载状态，让页面跳转时保持加载状态
      }, 1000);
      
    } catch (error: unknown) {
      let errorMessage = "注册失败，请重试";
      
      if (error instanceof Error) {
        // 将常见的英文错误信息转换为中文
        const message = error.message.toLowerCase();
        if (message.includes('user already registered') || message.includes('email already')) {
          errorMessage = "该邮箱已被注册，请使用其他邮箱或直接登录";
        } else if (message.includes('invalid email')) {
          errorMessage = "邮箱格式不正确";
        } else if (message.includes('password') && message.includes('weak')) {
          errorMessage = "密码强度不够，请使用更强的密码";
        } else if (message.includes('password') && message.includes('short')) {
          errorMessage = "密码长度不够，至少需要6个字符";
        } else if (message.includes('network') || message.includes('connection')) {
          errorMessage = "网络连接错误，请检查网络后重试";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      // 只有在出错时才立即结束加载状态
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600">注册</CardTitle>
          <CardDescription>创建您的新账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">密码</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">确认密码</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? "注册中..." : "立即注册"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              已有账户？{" "}
              <Link href="/login" className="text-purple-600 underline underline-offset-4 hover:text-purple-700">
                立即登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
