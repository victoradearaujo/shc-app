import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./tests/helpers/globalSetup.ts"],
    setupFiles: ["./tests/helpers/mockPrisma.ts"],
    maxWorkers: 1,
    minWorkers: 1,
  },
});
