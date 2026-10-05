import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  target: "node20",
  fixedExtension: false,
  dts: false,
});
