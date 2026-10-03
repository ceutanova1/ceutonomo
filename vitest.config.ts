import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": `${import.meta.dirname}/src` } },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**", "tests/production/**"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/domain/**/*.ts", "src/rules/**/*.ts"],
    },
  },
});
