import { readFile } from "fs";
import { promisify } from "util";
import { join, resolve } from "path";

const readFileP = promisify(readFile);

const cache: { [key: string]: Array<string> } = {};

export async function readDBCached(fileName: string): Promise<Array<string>> {
  if(cache[fileName]) {
    return cache[fileName];
  }

  const file = join(__dirname, "..", "db", fileName);
  const lines = await readFileP(file, "utf8")
    .then(c => c.split('\n').filter(c => c));
  cache[fileName] = lines

  return cache[fileName];
}
