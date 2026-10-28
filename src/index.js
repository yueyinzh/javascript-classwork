import { runCli } from './cli.js';

runCli().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unexpected error: ${message}`);
  process.exitCode = 1;
});
