import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/dodo/",
  plugins: [react()],
  assetsInclude: ['**/*.webm', '**/*.mp4', '**/*.ogv'],
  publicDir: 'public',
});