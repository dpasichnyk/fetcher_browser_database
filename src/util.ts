export function random<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fromArrayToObject<T extends string>(arr: Array<Array<T>>): { [key: string] : string } {
  const obj: { [key: string]: string } = {};
  for (const [key, val] of arr) {
    obj[key] = val;
  }
  return obj;
}

export function assertUnreachable(x: never): never {
  throw new Error(`Didn't expect to get here: ${x}`);
}
