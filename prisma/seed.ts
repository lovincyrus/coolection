import { execSync } from 'child_process';

const runSeedScript = (scriptPath: string) => {
  console.log(`Running seed script: ${scriptPath}`);
  try {
    execSync(`ts-node --compiler-options '{"module":"CommonJS"}' ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error occurred while running ${scriptPath}:`, error);
    // Don't exit the process if an error occurs; just log the error.
  }
};

const main = async () => {
  runSeedScript('prisma/seed-websites.ts');
  runSeedScript('prisma/seed-lists.ts');
};

main();