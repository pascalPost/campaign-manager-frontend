module.exports = {
    root: true,
    env: {browser: true, es2020: true},
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:react-hooks/recommended",
        "prettier",
        'plugin:import/recommended',
    ],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    // parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: "./",
    },
    plugins: ["react-refresh", "@typescript-eslint", "import"],
    rules: {
        // "import/no-unresolved": "error",
        //     "react-refresh/only-export-components": [
        //         "warn",
        //         {allowConstantExport: true},
        //     ],
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        'import/resolver': {
            "typescript": {
                "alwaysTryTypes": true,
                project: "./tsconfig.json",
            }
            // alias: {
            //     map: [
            //         ['@', './src'],
            //     ],
            //     extensions: ['.ts', '.js', '.jsx', 'tsx', '.json']
            // },
        },
    },
};
