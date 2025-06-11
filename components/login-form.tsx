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
  const [phone, setPhone] = useState("");
  const [account, setAccount] = useState(""); // 账号（手机号或邮箱）
  const [verifyCode, setVerifyCode] = useState("");
  const [loginType, setLoginType] = useState<"phone_code" | "account_password">("phone_code");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // 调试信息
  console.log("LoginForm rendered, loginType:", loginType);

  // 获取验证码（手机号登录）
  const getVerifyCode = async () => {
    console.log("🔥 [登录] 开始获取验证码流程");
    console.log("📱 [登录] 手机号:", phone);
    
    const supabase = createClient();
    setIsSendingCode(true);
    setError(null);

    try {
      console.log("📞 [登录] 手机号:", phone);
      console.log("🚀 [登录] 准备调用 supabase.auth.signInWithOtp...");
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim()
      });
      
      console.log("❌ [登录] signInWithOtp 错误信息:", error);
      
      if (error) {
        console.log("🚨 [登录] 发生错误，抛出异常:", error.message);
        throw error;
      }
      
      console.log("✅ [登录] 验证码发送成功");
      toast.success('短信已发送至您的手机中，请注意查收。');
      
      // 开始倒计时
      console.log("⏰ [登录] 开始60秒倒计时");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            console.log("⏰ [登录] 倒计时结束");
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: unknown) {
      console.log("💥 [登录] 捕获到错误:", error);
      let errorMessage = "发送验证码失败，请重试";
      if (error instanceof Error) {
        console.log("📝 [登录] 错误详细信息:", error.message);
        if (error.message.includes("Signups not allowed") || error.message.includes("Forbidden")) {
          errorMessage = "该手机号尚未注册，请先注册账户";
        } else if (error.message.includes("Invalid phone")) {
          errorMessage = "手机号格式不正确，请输入正确的手机号";
        } else if (error.message.includes("User not found")) {
          errorMessage = "该手机号尚未注册，请先注册账户";
        } else {
          errorMessage = error.message;
        }
      }
      console.log("🔔 [登录] 最终错误消息:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("🏁 [登录] 获取验证码流程结束");
      setIsSendingCode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      if (loginType === "account_password") {
        console.log("🎯 [登录] 账号密码登录流程");
        console.log("👤 [登录] 账号:", account);
        console.log("🔐 [登录] 密码长度:", password.length);
        
        // 判断账号是邮箱还是手机号
        const isEmail = account.includes('@');
        
        if (isEmail) {
          console.log("📧 [登录] 识别为邮箱登录");
          const { error } = await supabase.auth.signInWithPassword({
            email: account,
            password,
          });
          if (error) throw error;
        } else {
          console.log("📱 [登录] 识别为手机号登录");
          
          const { error } = await supabase.auth.signInWithPassword({
            phone: account.trim(),
            password,
          });
          if (error) throw error;
        }
      } else {
        console.log("🎯 [登录] 手机验证码登录流程");
        console.log("📱 [登录] 手机号:", phone);
        console.log("🔢 [登录] 验证码:", verifyCode);
        
        // 手机号验证码登录
        console.log("🚀 [登录] 准备调用 supabase.auth.verifyOtp...");
        
        const { error } = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: verifyCode,
          type: 'sms',
        });
        
        console.log("❌ [登录] verifyOtp 错误信息:", error);
        if (error) {
          console.log("🚨 [登录] 发生错误，抛出异常:", error.message);
          throw error;
        }
      }
      
      // 设置成功状态
      setIsLoading(false);
      setIsSuccess(true);
      
      console.log("🎉 [登录] 登录成功！");
      // 显示成功提示
      toast.success('登录成功！正在跳转...', {
        duration: 2000,
      });
      
      // 短暂延迟后跳转，让用户看到成功提示
      console.log("🔄 [登录] 1.5秒后跳转到保护页面");
      setTimeout(() => {
        router.push("/protected");
        router.refresh(); // 刷新页面状态
      }, 1500);
      
    } catch (error: unknown) {
      console.log("💥 [登录] 捕获到错误:", error);
      let errorMessage = "登录失败，请重试";
      if (error instanceof Error) {
        console.log("📝 [登录] 错误详细信息:", error.message);
        // 将常见的英文错误信息翻译为中文
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "账号或密码错误";
            break;
          case "Email not confirmed":
            errorMessage = "邮箱尚未验证，请检查您的邮箱";
            break;
          case "Too many requests":
            errorMessage = "请求过于频繁，请稍后再试";
            break;
          case "Invalid token":
            errorMessage = "验证码错误或已过期";
            break;
          case "Token has expired":
            errorMessage = "验证码已过期，请重新获取";
            break;
          default:
            errorMessage = error.message;
        }
      }
      console.log("🔔 [登录] 最终错误消息:", errorMessage);
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
            {loginType === "account_password" ? "输入您的账号和密码以登录" : "输入您的手机号获取验证码登录"}
          </CardDescription>
          {/* 登录方式切换 */}
          <div className="flex justify-center mt-4">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType("phone_code")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginType === "phone_code"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                验证码登录
              </button>
              <button
                type="button"
                onClick={() => setLoginType("account_password")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginType === "account_password"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                密码登录
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {loginType === "account_password" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="account">账号</Label>
                    <Input
                      id="account"
                      type="text"
                      placeholder="请输入手机号或邮箱"
                      required
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
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
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="verifyCode">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verifyCode"
                        type="text"
                        placeholder="请输入验证码"
                        required
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getVerifyCode}
                        disabled={isSendingCode || countdown > 0 || !phone.trim()}
                        className="whitespace-nowrap"
                      >
                        {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
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
