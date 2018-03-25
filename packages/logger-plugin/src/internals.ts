export const repeat = (str, times) => new Array(times + 1).join(str);
export const pad = (num, maxLength) => repeat('0', maxLength - num.toString().length) + num;
