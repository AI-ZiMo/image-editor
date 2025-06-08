"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // 显示成功提示
      toast.success('已安全退出登录', {
        duration: 2000,
      });
      
      // 短暂延迟后跳转
      setTimeout(() => {
        router.push("/login");
        router.refresh(); // 刷新页面状态
      }, 800);
      
    } catch (error) {
      toast.error('退出登录失败，请重试');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={logout} 
      variant="outline" 
      disabled={isLoading}
      className="text-gray-600 hover:text-gray-800"
    >
      {isLoading ? "退出中..." : "退出登录"}
    </Button>
  );
}
