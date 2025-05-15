export function classNames(c: { [cssClass: string]: boolean }) {
  const take: string[] = [];
  for (const [cssClass, condition] of Object.entries(c)) {
    if (condition) {
      take.push(cssClass);
    }
  }
  return take.join(" ");
}
