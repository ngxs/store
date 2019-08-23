export const repeat = (str: string, times: number) => new Array(times + 1).join(str);

export const pad = (num: number, maxLength: number) =>
  repeat('0', maxLength - num.toString().length) + num;

export function formatTime(time: Date) {
  return (
    pad(time.getHours(), 2) +
    `:` +
    pad(time.getMinutes(), 2) +
    `:` +
    pad(time.getSeconds(), 2) +
    `.` +
    pad(time.getMilliseconds(), 3)
  );
}
