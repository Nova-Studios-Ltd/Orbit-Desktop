export default async function TimeoutUntil(target: unknown, condition: unknown, evalType: boolean, timeout?: number) {
  let _timeout = timeout;

  if (_timeout != null) {
    _timeout *= 10;
  }
  else {
    _timeout = 10;
  }

  let i = 0;

  if (evalType) {
    while (target == condition && i < _timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      i++;
    }
  }
  else
  {
    while (target != condition && i < _timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      i++;
    }
  }
}
