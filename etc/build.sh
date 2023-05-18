rimraf dist

# Create the dist directory if it doesn't exist
mkdir -p dist

export NODE_ENV=production

tsc -p ./tsconfig.build.json --pretty

cp -R src/public dist/src/public

cp package.json dist/
sed -i '' 's/\.\/bin\/www\.ts/\.\/bin\/www\.js/g' dist/package.json
