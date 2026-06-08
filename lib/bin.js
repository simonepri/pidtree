import {spawn} from 'node:child_process';

/**
 * Strips known-benign noise from a command's stderr.
 * @param {string} stderr
 * @returns {string|undefined}
 */
export function stripStderr(stderr) {
  if (!stderr) return;
  stderr = stderr.trim();
  // Strip bogus screen size error.
  // See https://github.com/microsoft/vscode/issues/98590
  const regex = /your \d+x\d+ screen size is bogus\. expect trouble/gi;
  stderr = stderr.replaceAll(regex, '');

  return stderr.trim();
}

/**
 * Spawn a binary and read its stdout.
 * @param {string} cmd The name of the binary to spawn.
 * @param {string[]} args The arguments for the binary.
 * @param {object} [options] Optional options for the spawn function.
 * @param {Function} done done(err, stdout, code)
 */
export function run(cmd, args, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = undefined;
  }

  let executed = false;
  const child = spawn(cmd, args, options);
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('error', (error) => {
    if (executed) return;
    executed = true;
    // Pass the original error through so callers can inspect err.code
    // (e.g. 'ENOENT' when the binary is missing) to decide on a fallback.
    done(error);
  });

  child.on('close', (code) => {
    if (executed) return;
    executed = true;

    stderr = stripStderr(stderr);
    if (stderr) {
      done(new Error(stderr));
      return;
    }

    done(null, stdout, code);
  });
}
