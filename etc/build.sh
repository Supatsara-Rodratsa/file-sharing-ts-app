#!/bin/sh
rimraf dist

# Set environment variables
export NODE_ENV=production

# Run TypeScript compilation
tsc -p ./tsconfig.build.json --pretty

# Copy public directory
cp -R src/public dist/src/public

# Copy view directory
cp -R src/views dist/src/views

# Copy package.json
cp package.json dist/

# Replace file path in package.json
sed -i 's/\.\/bin\/www\.ts/\.\/bin\/www\.js/g' dist/package.json