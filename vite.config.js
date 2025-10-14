import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 输出到 docs/ 以支持 GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "./", // 关键：让相对路径在 Pages 下生效
  build: {
    outDir: "docs",
    emptyOutDir: true
  }
});