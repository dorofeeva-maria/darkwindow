// Regenerates the Linux screenshot baselines in the official Playwright
// container (the same OS as CI), so they match what CI compares against.
// Needs Docker. node_modules inside the container is a separate volume.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { devDependencies } = JSON.parse(readFileSync("package.json", "utf8"));
const version = devDependencies["@playwright/test"];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const cwd = process.cwd();

execFileSync(
  "docker",
  [
    "run",
    "--rm",
    "--ipc=host",
    "-v",
    `${cwd}:/work`,
    "-v",
    "/work/node_modules",
    "-w",
    "/work",
    image,
    "bash",
    "-c",
    "npm ci --no-audit --no-fund && npx playwright test --update-snapshots",
  ],
  { stdio: "inherit" },
);
