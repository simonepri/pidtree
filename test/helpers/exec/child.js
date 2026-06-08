let started = false;

// Keeps the process alive and prints its pid once, so the test knows it is up.
setInterval(() => {
  if (started) return;
  console.log(process.pid);
  started = true;
}, 100);
