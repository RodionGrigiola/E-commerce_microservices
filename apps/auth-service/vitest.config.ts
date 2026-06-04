import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true, // Позволит не импортировать describe/it в каждом файле, как в Jest
  },
});
