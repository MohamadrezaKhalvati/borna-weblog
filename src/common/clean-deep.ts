export function cleanDeep(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    )
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}
