# Test Service Adapter Implementation

# Set up the environment
echo "Setting up test environment..."
cd "$(dirname "$0")"
cd ..

# Compile TypeScript files
echo "Compiling TypeScript..."
npx tsc

# Run the test script
echo "Running service type tests..."
node ./dist/scripts/testServiceTypes.js

# Exit with the same status as the test script
exit $?
