import { execFileSync } from "node:child_process";

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function managedProcessGroupIds(server) {
  const processGroupIds = new Set(server.processGroupIds ?? []);
  if (server.processGroupId) processGroupIds.add(server.processGroupId);
  return [...processGroupIds].filter((value) => Number.isInteger(value) && value > 0);
}

function processTreeIsAlive(server) {
  for (const processGroupId of managedProcessGroupIds(server)) {
    try {
      process.kill(-processGroupId, 0);
      return true;
    } catch (error) {
      if (error?.code === "EPERM") return true;
      if (error?.code !== "ESRCH") throw error;
    }
  }
  return false;
}

function readProcessTable() {
  const output = execFileSync("ps", ["-axo", "pid=,ppid=,pgid="], {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((line) => line.trim().split(/\s+/).map(Number))
    .filter(([pid, parentPid, processGroupId]) =>
      [pid, parentPid, processGroupId].every((value) => Number.isInteger(value)),
    )
    .map(([pid, parentPid, processGroupId]) => ({
      parentPid,
      pid,
      processGroupId,
    }));
}

function descendantProcessIds(processes, rootPid) {
  const descendants = new Set([rootPid]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const { parentPid, pid } of processes) {
      if (descendants.has(parentPid) && !descendants.has(pid)) {
        descendants.add(pid);
        changed = true;
      }
    }
  }

  return descendants;
}

export function trackManagedProcessTree(server, intervalMs = 50) {
  if (process.platform === "win32" || !server.child.pid) return () => {};

  server.processGroupIds ??= new Set();
  if (server.processGroupId) server.processGroupIds.add(server.processGroupId);

  const capture = () => {
    try {
      const processes = readProcessTable();
      const descendants = descendantProcessIds(processes, server.child.pid);
      for (const process of processes) {
        if (descendants.has(process.pid) && process.processGroupId > 0) {
          server.processGroupIds.add(process.processGroupId);
        }
      }
    } catch (error) {
      server.processTreeTrackingError ??= error;
    }
  };

  server.captureProcessTree = capture;
  capture();
  const timer = setInterval(capture, intervalMs);
  timer.unref();
  const stop = () => clearInterval(timer);
  server.stopProcessTreeTracking = stop;
  return stop;
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

function stopProcessTreeTracking(server) {
  server.stopProcessTreeTracking?.();
  server.stopProcessTreeTracking = null;
}

function throwIfProcessTreeTrackingFailed(server) {
  if (!server.processTreeTrackingError) return;
  throw cleanupError(
    server,
    "process-tree",
    server.processTreeTrackingError instanceof Error
      ? server.processTreeTrackingError.message
      : String(server.processTreeTrackingError),
    server.processTreeTrackingError,
  );
}

function sendSignal(server, signal) {
  let didSignalProcessGroup = false;

  for (const processGroupId of managedProcessGroupIds(server)) {
    try {
      process.kill(-processGroupId, signal);
      didSignalProcessGroup = true;
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }

  if (!didSignalProcessGroup && server.child.exitCode === null) server.child.kill(signal);
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
  server.captureProcessTree?.();
  if (
    (server.didClose && !processTreeIsAlive(server)) ||
    (!server.closedPromise && !server.processGroupId && server.child.exitCode !== null)
  ) {
    stopProcessTreeTracking(server);
    destroyOutput(server);
    throwIfProcessTreeTrackingFailed(server);
    return;
  }

  const closedPromise =
    server.closedPromise ??
    new Promise((resolveClose) => server.child.once("close", resolveClose));
  let phase = "SIGTERM";

  try {
    sendSignal(server, phase);
    if (await stopsWithin(server, closedPromise, gracefulTimeoutMs)) {
      throwIfProcessTreeTrackingFailed(server);
      return;
    }

    phase = "SIGKILL";
    sendSignal(server, phase);
    if (await stopsWithin(server, closedPromise, forceTimeoutMs)) {
      throwIfProcessTreeTrackingFailed(server);
      return;
    }

    throw cleanupError(
      server,
      phase,
      `process did not close within ${forceTimeoutMs}ms after SIGKILL`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("cleanup failed")) throw error;
    throw cleanupError(server, phase, error instanceof Error ? error.message : String(error), error);
  } finally {
    stopProcessTreeTracking(server);
    destroyOutput(server);
  }
}
