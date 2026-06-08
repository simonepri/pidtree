/**
 * Parses the `<ppid> <pid>` output produced by the ps/wmic/powershell backends
 * into a list of `[ppid, pid]` pairs. The header row and any non-numeric lines
 * are skipped, and all common line endings (\n, \r\n, \r\r\n) are handled.
 * @param {string} stdout The raw command output.
 * @returns {Array<[number, number]>}
 */
export function parse(stdout) {
  const list = [];
  for (const rawLine of stdout.split(/\r*\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const [rawPpid, rawPid] = line.split(/\s+/);
    const ppid = Number.parseInt(rawPpid, 10);
    const pid = Number.parseInt(rawPid, 10);
    // Skips the header row and any stray output.
    if (Number.isNaN(ppid) || Number.isNaN(pid)) continue;

    list.push([ppid, pid]);
  }

  return list;
}
