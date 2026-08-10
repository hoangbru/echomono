"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type RefreshButtonProps = {
  onRefresh: () => void;
};

export const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-10 h-10 text-destructive/80" />
      <p className="text-destructive font-medium">
        Đã có lỗi xảy ra khi tải danh sách
      </p>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="border-border text-foreground hover:bg-muted"
      >
        <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
      </Button>
    </div>
  );
};
