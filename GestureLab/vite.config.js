import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
var src = fileURLToPath(new URL("src", import.meta.url));
console.log("[vite] src alias:", src);
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": src,
        },
    },
    base: "./",
    server: {
        host: "0.0.0.0",
        port: 3000,
    },
});
