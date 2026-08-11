import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export function slugify(str: string): string {
  if (!str) return "";

  return removeVietnameseTones(str) // Tận dụng lại lõi xóa dấu ở trên
    .replace(/[^a-zA-Z0-9]/g, "-") // Biến khoảng trắng và kí tự lạ thành gạch ngang
    .replace(/-+/g, "-") // Rút gọn các dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, "") // Xóa dấu gạch ngang ở 2 đầu
    .toLowerCase(); // Ép về chữ thường
}
