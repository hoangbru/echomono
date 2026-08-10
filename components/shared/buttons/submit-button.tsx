"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button, ButtonProps } from "@/components/ui/button";

import { cn } from "@/utils/helpers";

interface SubmitButtonProps extends ButtonProps {
  isSubmitting: boolean;
  loadingText?: string;
  defaultText: string;
}

export function SubmitButton({
  isSubmitting,
  loadingText = "Đang xử lý...",
  defaultText,
  className,
  ...props
}: SubmitButtonProps) {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn("flex-1 font-bold", className)}
        {...props}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {loadingText}
          </>
        ) : (
          defaultText
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        className="px-8"
      >
        Huỷ
      </Button>
    </div>
  );
}
