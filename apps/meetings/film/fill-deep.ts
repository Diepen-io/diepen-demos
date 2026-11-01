/** Applies `fill` to every string inside a value, keeping its shape. */
export function fillDeep<T>(value: T, fill: (text: string) => string): T {
  const visit = (item: unknown): unknown => {
    if (typeof item === "string") return fill(item);
    if (Array.isArray(item)) return item.map(visit);
    if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, visit(entry)]));
    return item;
  };
  return visit(value) as T;
}
