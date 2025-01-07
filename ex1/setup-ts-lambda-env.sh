#!/bin/bash

# Create assets directory if it doesn't exist
mkdir -p assets

# Create tsconfig.json for assets
cat > assets/tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["es2020","DOM"],
    "declaration": false,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "outDir": "dist",
    "rootDir": "./",
    "typeRoots": ["./node_modules/@types"]
  },
  "exclude": ["node_modules", "dist"]
}
EOL

# Install necessary dependencies
npm install --save-dev @types/aws-lambda
npm install @types/node -D

# Add build scripts to package.json
# Using jq to modify package.json
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed. Please install jq first."
    exit 1
fi

# Backup original package.json
cp package.json package.json.backup

# Add new scripts while preserving existing ones
jq '.scripts += {
    "build:lambda": "tsc -p assets/tsconfig.json",
    "watch:lambda": "tsc -w -p assets/tsconfig.json",
    "deploy": "npm run build:lambda && cdk synth && cdk deploy"
}' package.json.backup > package.json

# Create assets/.gitignore
cat > assets/.gitignore << EOL
dist/
node_modules/
*.js
!jest.config.js
*.d.ts
EOL

echo "Setup complete! Your Lambda TypeScript environment is ready."
echo "You can now:"
echo "1. Add your TypeScript Lambda functions in the assets folder"
echo "2. Run 'npm run build:lambda' to compile"
echo "3. Run 'npm run deploy' to build and deploy, Includes cdk synth.."
echo "4. Remember to grab your lambda code in cdk from "dist" code: lambda.Code.fromAsset(path.join(__dirname, "../assets/dist")),"

