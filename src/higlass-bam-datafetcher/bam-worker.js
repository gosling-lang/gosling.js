import { expose } from "threads/worker";

const add = (a, b) => {
  return a + b
}
expose({add});