export const repeat = (str: string, times: number) => new Array(times + 1).join(str);
export const pad = (num: number, maxLength: number) =>
  repeat('0', maxLength - num.toString().length) + num;
