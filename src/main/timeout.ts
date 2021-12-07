export default async function TimeoutUntil(target: any, condition: any, evalType: boolean, timeout?: number) {
  if (timeout != null) {
    timeout = timeout * 10;
  }
  else {
    timeout = 10;
  }

  let i = 0;

  if (evalType) {
    while (target == condition && i < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      i++;
    }
  }
  else
  {
    while (target != condition && i < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      i++;
    }
  }


}
