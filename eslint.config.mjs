import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // ✅ Adds Node.js globals, including `process`
        ...globals.es2020, // ✅ Includes ES2020 features like `BigInt`
      },
      parserOptions: {
        ecmaVersion: "latest", // ✅ Supports latest ES features
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    env: {
      es2020: true, // ✅ Enables ES2020 globals
      browser: true,
      node: true, // ✅ Ensures `process` is recognized
      mocha: true, // ✅ If using Mocha for tests
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-undef": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.recommended,
];
