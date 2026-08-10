"use client";

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
