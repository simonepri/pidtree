let started = false;
setInterval(() => {
  if (started) return;
  console.log(process.pid);
  started = true;
}, 100); // Does nothing, but prevents exit
