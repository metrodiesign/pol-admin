import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { assertPortAvailable } from "./lib/workspace-verification.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function verifySignal(signal, expectedCode) {
  const child = spawn(process.execPath, ["scripts/smoke-workspace-routes.mjs"], {
    cwd: repositoryRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  let signalSent = false;
  const capture = (chunk) => {
    output = `${output}${chunk}`.slice(-20_000);
    if (!signalSent && output.includes("Admin /:")) {
      signalSent = true;
      child.kill(signal);
    }
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);

  const startupFallback = setTimeout(() => {
    if (!signalSent && child.exitCode === null) {
      signalSent = true;
      child.kill(signal);
    }
  }, 5_000);

  let deadline;
  try {
    const result = await Promise.race([
      new Promise((resolveClose, rejectClose) => {
        child.once("close", (code, receivedSignal) => resolveClose({ code, receivedSignal }));
        child.once("error", rejectClose);
      }),
      new Promise((_, rejectTimeout) => {
        deadline = setTimeout(
          () => rejectTimeout(new Error(`${signal} smoke did not exit within 20s\n${output}`)),
          20_000,
        );
      }),
    ]);

    if (!signalSent || result.code !== expectedCode || result.receivedSignal !== null) {
      throw new Error(
        `${signal} expected exit ${expectedCode}, got code=${result.code} signal=${result.receivedSignal}\n${output}`,
      );
    }
  } finally {
    clearTimeout(startupFallback);
    clearTimeout(deadline);
    if (child.exitCode === null) child.kill("SIGKILL");
  }

  await Promise.all([assertPortAvailable(3001), assertPortAvailable(3002)]);
  console.log(`${signal}: exit ${expectedCode}, ports released`);
}

await verifySignal("SIGINT", 130);
await verifySignal("SIGTERM", 143);
