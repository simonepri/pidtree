'use strict';

var os = require('os');
var bin = require('./bin');

// PowerShell command used to list every process as "<ppid> <pid>" lines.
// Get-CimInstance is the supported replacement for the removed wmic utility
// (see https://github.com/simonepri/pidtree/issues/20).
// $ProgressPreference is silenced so PowerShell does not serialize its
// progress stream (e.g. "Preparing modules for first use.") to stderr as
// CLIXML, which would otherwise be treated as an error.
var COMMAND =
  "$ProgressPreference = 'SilentlyContinue'; " +
  'Get-CimInstance -ClassName Win32_Process | ' +
  'ForEach-Object { "$($_.ParentProcessId) $($_.ProcessId)" }';

// The command is passed through -EncodedCommand (Base64 of the UTF-16LE
// string) to avoid any cross-shell argument quoting issues on Windows.
var ENCODED = Buffer.from(COMMAND, 'utf16le').toString('base64');

/**
 * Gets the list of all the pids of the system through PowerShell.
 * Used as a fallback on Windows installations where wmic is not available
 * (e.g. Windows 11 24H2 and Windows Server 2025).
 * @param  {Function} callback(err, list)
 */
function powershell(callback) {
  var args = ['-NoProfile', '-NonInteractive', '-EncodedCommand', ENCODED];
  var options = {windowsHide: true};
  bin('powershell', args, options, function(err, stdout, code) {
    if (err) {
      callback(err);
      return;
    }

    if (code !== 0) {
      callback(
        new Error('pidtree powershell command exited with code ' + code)
      );
      return;
    }

    // Example of stdout
    //
    // 0 777
    // 777 778
    // 0 779

    try {
      stdout = stdout.split(os.EOL);

      var list = [];
      for (var i = 0; i < stdout.length; i++) {
        stdout[i] = stdout[i].trim();
        if (!stdout[i]) continue;
        var parts = stdout[i].split(/\s+/);
        var ppid = parseInt(parts[0], 10); // PPID
        var pid = parseInt(parts[1], 10); // PID
        if (isNaN(ppid) || isNaN(pid)) continue;
        list.push([ppid, pid]);
      }

      callback(null, list);
    } catch (error) {
      callback(error);
    }
  });
}

module.exports = powershell;
