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
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [signUpType, setSignUpType] = useState<"email" | "phone">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const router = useRouter();

  // 调试信息
  console.log("SignUpForm rendered, signUpType:", signUpType);

  // 获取验证码（注册）
  const getVerifyCode = async () => {
    console.log("🔥 [注册] 开始获取验证码流程");
    console.log("📱 [注册] 手机号:", phone);
    console.log("🔐 [注册] 密码长度:", password.length);
    
    const supabase = createClient();
    setIsSendingCode(true);
    setError(null);

    try {
      console.log("📞 [注册] 手机号:", phone);
      console.log("🚀 [注册] 准备调用 supabase.auth.signUp...");
      
      const { data, error } = await supabase.auth.signUp({
        phone: phone.trim(),
        password: password
      });
      
      console.log("📥 [注册] signUp 响应数据:", data);
      console.log("❌ [注册] signUp 错误信息:", error);
      
      if (error) {
        console.log("🚨 [注册] 发生错误，抛出异常:", error.message);
        throw error;
      }
      
      console.log("✅ [注册] signUp 成功！设置验证码已发送状态");
      setIsCodeSent(true);
      toast.success('短信已发送至您的手机中，请注意查收。');
      
      // 开始倒计时
      console.log("⏰ [注册] 开始60秒倒计时");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            console.log("⏰ [注册] 倒计时结束");
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: unknown) {
      console.log("💥 [注册] 捕获到错误:", error);
      let errorMessage = "发送验证码失败，请重试";
      if (error instanceof Error) {
        console.log("📝 [注册] 错误详细信息:", error.message);
        if (error.message.includes("Signups not allowed") || error.message.includes("Forbidden")) {
          errorMessage = "当前项目未开启手机注册功能，请联系管理员或使用邮箱注册";
        } else if (error.message.includes("SMS not supported")) {
          errorMessage = "短信服务未配置，请联系管理员";
        } else if (error.message.includes("Invalid phone")) {
          errorMessage = "手机号格式不正确，请输入正确的手机号";
        } else {
          errorMessage = error.message;
        }
      }
      console.log("🔔 [注册] 最终错误消息:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("🏁 [注册] 获取验证码流程结束");
      setIsSendingCode(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (signUpType === "email" && password !== repeatPassword) {
      const errorMsg = "密码不匹配";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      if (signUpType === "email") {
        // 邮箱注册
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm`,
          },
        });
        
        if (error) throw error;
        
        toast.success('注册成功！请检查您的邮箱以验证账户', {
          duration: 3000,
        });
        
        // 短暂延迟后跳转
        setTimeout(() => {
          router.push("/sign-up-success");
        }, 1000);
      } else {
        // 手机号注册 - 使用验证码完成注册
        console.log("🎯 [注册验证] 开始手机号注册验证流程");
        console.log("📱 [注册验证] 手机号:", phone);
        console.log("🔢 [注册验证] 验证码:", verifyCode);
        console.log("🚀 [注册验证] 准备调用 supabase.auth.verifyOtp...");
        
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: verifyCode,
          type: 'sms',
        });
        
        console.log("📥 [注册验证] verifyOtp 响应数据:", data);
        console.log("❌ [注册验证] verifyOtp 错误信息:", error);
        
        if (error) {
          console.log("🚨 [注册验证] 发生错误，抛出异常:", error.message);
          throw error;
        }
        
        console.log("🎉 [注册验证] 验证成功！用户注册完成");
        toast.success('注册成功！', {
          duration: 3000,
        });
        
        // 短暂延迟后跳转
        console.log("🔄 [注册验证] 1秒后跳转到成功页面");
        setTimeout(() => {
          router.push("/sign-up-success");
        }, 1000);
      }
      
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
          <CardDescription>
            {signUpType === "email" ? "使用邮箱创建您的新账户" : "使用手机号创建您的新账户"}
          </CardDescription>
          {/* 注册方式切换 */}
          <div className="flex justify-center mt-4">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSignUpType("phone")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  signUpType === "phone"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                手机注册
              </button>
              <button
                type="button"
                onClick={() => setSignUpType("email")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  signUpType === "email"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                邮箱注册
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {signUpType === "email" ? (
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
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请设置登录密码"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                        disabled={isSendingCode || countdown > 0 || !phone.trim() || !password.trim()}
                        className="whitespace-nowrap"
                      >
                        {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {signUpType === "email" && (
                <>
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
                </>
              )}
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
