import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// alias "@" -> ./src ให้ตรงกับ tsconfig paths (เลี่ยง vite-tsconfig-paths dep เพิ่ม)
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
