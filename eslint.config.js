import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginReact from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  reactRefresh.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["eslint.config.js", "vite.config.js"],
    rules: {
      "no-underscore-dangle": "off",
      "import/no-extraneous-dependencies": ["error", { packageDir: __dirname }],
      "import/no-unresolved": "off",
    },
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "import/extensions": "off",
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "no-use-before-define": ["error", { functions: false }],
      "import/prefer-default-export": "off",
      "no-param-reassign": ["error", { props: false }],
      "react/jsx-filename-extension": [
        2,
        { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      ],
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [["@", path.resolve(__dirname, "src")]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  eslintConfigPrettier,
]);
