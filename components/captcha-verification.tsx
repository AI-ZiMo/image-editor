"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

// 扩展Window接口以包含阿里通信SDK函数
declare global {
  interface Window {
    initAlicom4: (config: CaptchaConfig, handler: (captchaObj: CaptchaObject) => void) => void;
  }
}

interface CaptchaObject {
  onReady: (callback: () => void) => CaptchaObject;
  onSuccess: (callback: () => void) => CaptchaObject;
  onError: (callback: (error: unknown) => void) => CaptchaObject;
  onBoxShow: (callback: () => void) => CaptchaObject;
  showCaptcha: () => void;
  getValidate: () => CaptchaValidateResult | null;
}

interface CaptchaConfig {
  captchaId: string;
  language: string;
  product: string;
  protocol: string;
}

interface CaptchaValidateResult {
  lot_number: string;
  pass_token: string;
  gen_time: string;
  captcha_output: string;
}

interface CaptchaVerificationProps {
  onSuccess: (result: CaptchaValidateResult) => void;
  onError: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export default function CaptchaVerification({ 
  onSuccess, 
  onError, 
  buttonText = "点击进行验证",
  className = ""
}: CaptchaVerificationProps) {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [captchaObj, setCaptchaObj] = useState<CaptchaObject | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 检查SDK是否已加载
    if (typeof window.initAlicom4 === 'undefined') {
      onError('图形验证码SDK未加载，请刷新页面重试');
      return;
    }

    const config: CaptchaConfig = {
      captchaId: process.env.NEXT_PUBLIC_CAPTCHA_ID || '8848b0418f53cc0c2cc6853c6d20c6d3',
      language: 'eng',
      product: 'bind', // 使用模态框模式
      protocol: 'https://'
    };

    try {
      window.initAlicom4(config, (captchaObjInstance: CaptchaObject) => {
        setCaptchaObj(captchaObjInstance);
        
        captchaObjInstance
          .onReady(() => {
            console.log('图形验证码准备就绪');
            setIsReady(true);
            setIsLoading(false);
          })
          .onSuccess(() => {
            console.log('图形验证码验证成功');
            const result = captchaObjInstance.getValidate();
            if (result) {
              onSuccess({
                lot_number: result.lot_number,
                pass_token: result.pass_token,
                gen_time: result.gen_time,
                captcha_output: result.captcha_output
              });
            } else {
              onError('获取验证结果失败，请重试');
            }
          })
          .onError((error: unknown) => {
            console.error('图形验证码错误:', error);
            onError('图形验证失败，请重试');
            setIsLoading(false);
          })
          .onBoxShow(() => {
            console.log('图形验证码弹窗显示');
            setIsLoading(false);
          });
      });
    } catch (error) {
      console.error('初始化图形验证码失败:', error);
      onError('初始化图形验证码失败，请刷新页面重试');
    }
  }, [onSuccess, onError]);

  const handleShowCaptcha = () => {
    if (!captchaObj) {
      onError('图形验证码未初始化，请刷新页面重试');
      return;
    }

    setIsLoading(true);
    try {
      captchaObj.showCaptcha();
    } catch (error) {
      console.error('显示图形验证码失败:', error);
      onError('显示图形验证码失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* 隐藏的验证码容器 */}
      <div ref={captchaRef} style={{ display: 'none' }} />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleShowCaptcha}
        disabled={!isReady || isLoading}
        className="w-full"
      >
        {isLoading ? '验证中...' : isReady ? buttonText : '正在加载验证码...'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        点击按钮完成图形验证后即可继续操作
      </p>
    </div>
  );
}