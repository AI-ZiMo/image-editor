import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthButton={false} />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center pt-16 p-6 md:p-10">
        <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-purple-600">
                  注册成功！
              </CardTitle>
                <CardDescription>请检查您的邮箱以确认账户</CardDescription>
            </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  您已成功注册账户。请检查您的邮箱并点击确认链接来激活您的账户，然后即可登录。
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/login">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      前往登录
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      返回首页
                    </Button>
                  </Link>
                </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
