module.exports = function (key, value) {
  const argv = [];
  let withoutIndex = null;

  process.argv.forEach((val, index) => {
    if (val === key) {
      withoutIndex = index + 1;
    } else if (index !== withoutIndex) {
      argv.push(val);
    }
  });

  argv.push(key, value);

  return argv;
};
