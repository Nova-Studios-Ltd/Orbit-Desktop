export default async function TimeoutUntil(target: any, condition: any, timeout?: Number) {
  if (timeout == null) {
    timeout = 10;
  }

  let i = 0;

  while (target != condition && i < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
    i++;
  }
}
