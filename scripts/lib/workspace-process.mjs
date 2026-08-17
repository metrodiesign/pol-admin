function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function processTreeIsAlive(server) {
  if (!server.processGroupId) return false;
  try {
    process.kill(-server.processGroupId, 0);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    if (error?.code === "EPERM") return true;
    throw error;
  }
}

async function stopsWithin(server, closedPromise, timeoutMs) {
  let didClose = server.didClose === true;
  void closedPromise.then(() => {
    didClose = true;
  });
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (didClose && !processTreeIsAlive(server)) return true;
    await delay(Math.min(10, Math.max(1, deadline - Date.now())));
  }

  return didClose && !processTreeIsAlive(server);
}

function destroyOutput(server) {
  server.child.stdout?.destroy();
  server.child.stderr?.destroy();
}

function sendSignal(server, signal) {
  if (server.processGroupId) {
    try {
      process.kill(-server.processGroupId, signal);
      return;
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }

  if (server.child.exitCode === null) server.child.kill(signal);
}

function cleanupError(server, phase, detail, cause) {
  const pid = server.child.pid ?? "unknown";
  return new Error(`${server.name} cleanup failed (PID ${pid}, phase ${phase}): ${detail}`, {
    cause,
  });
}

export function signalExitCode(signal) {
  return signal === "SIGINT" ? 130 : 143;
}

export async function waitForManagedServer(server, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${server.port}/login`;

  while (Date.now() < deadline) {
    if (server.spawnError) throw server.spawnError;
    if (server.child.exitCode !== null) {
      throw new Error(`${server.name} exited before ready (${server.child.exitCode})\n${server.output}`);
    }
    try {
      await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2_000) });
      return;
    } catch {
      await delay(100);
    }
  }

  throw new Error(`${server.name} did not become ready within ${timeoutMs}ms\n${server.output}`);
}

export async function stopManagedServer(
  server,
  { gracefulTimeoutMs = 5_000, forceTimeoutMs = 2_000 } = {},
) {
  if (
    (server.didClose && !processTreeIsAlive(server)) ||
    (!server.closedPromise && !server.processGroupId && server.child.exitCode !== null)
  ) {
    destroyOutput(server);
    return;
  }

  const closedPromise =
    server.closedPromise ??
    new Promise((resolveClose) => server.child.once("close", resolveClose));
  let phase = "SIGTERM";

  try {
    sendSignal(server, phase);
    if (await stopsWithin(server, closedPromise, gracefulTimeoutMs)) return;

    phase = "SIGKILL";
    sendSignal(server, phase);
    if (await stopsWithin(server, closedPromise, forceTimeoutMs)) return;

    throw cleanupError(
      server,
      phase,
      `process did not close within ${forceTimeoutMs}ms after SIGKILL`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("cleanup failed")) throw error;
    throw cleanupError(server, phase, error instanceof Error ? error.message : String(error), error);
  } finally {
    destroyOutput(server);
  }
}
