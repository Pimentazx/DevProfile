export function createMockFunction<Args extends unknown[], Result>(
  implementation: (...args: Args) => Result,
) {
  const calls: Args[] = [];

  return {
    calls,
    fn: (...args: Args): Result => {
      calls.push(args);
      return implementation(...args);
    },
  };
}
