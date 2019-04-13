async function deepForEach(root, fn) {
  const queue = [root];
  while (queue.length > 0) {
    const cur = queue.pop();
    // eslint-disable-next-line no-await-in-loop
    await fn(cur);
    if (Array.isArray(cur.children)) {
      cur.children.forEach(c => queue.push(c));
    }
  }
}

module.exports = {
  deepForEach
};
