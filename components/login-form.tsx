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
import { Check } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // 设置成功状态
      setIsLoading(false);
      setIsSuccess(true);
      
      // 显示成功提示
      toast.success('登录成功！正在跳转...', {
        duration: 2000,
      });
      
      // 短暂延迟后跳转，让用户看到成功提示
      setTimeout(() => {
        router.push("/protected");
        router.refresh(); // 刷新页面状态
      }, 1500);
      
    } catch (error: unknown) {
      let errorMessage = "登录失败，请重试";
      if (error instanceof Error) {
        // 将常见的英文错误信息翻译为中文
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "邮箱或密码错误";
            break;
          case "Email not confirmed":
            errorMessage = "邮箱尚未验证，请检查您的邮箱";
            break;
          case "Too many requests":
            errorMessage = "请求过于频繁，请稍后再试";
            break;
          default:
            errorMessage = "登录失败，请重试";
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
      // 只有在出错时才立即结束加载状态
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600">登录</CardTitle>
          <CardDescription>
            输入您的邮箱以登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm text-purple-600 underline-offset-4 hover:underline"
                  >
                    忘记密码？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button 
                type="submit" 
                className={`w-full ${isSuccess ? 'bg-green-600 hover:bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`} 
                disabled={isLoading || isSuccess}
              >
                {isSuccess ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    登录成功
                  </div>
                ) : isLoading ? "登录中..." : "登录"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              还没有账户？{" "}
              <Link
                href="/sign-up"
                className="text-purple-600 underline underline-offset-4 hover:text-purple-700"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
