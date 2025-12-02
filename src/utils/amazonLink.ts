export function buildAmazonLink(powerWatt: number, budgetRaw?: string | null) {
  const teile = [`Balkonkraftwerk`, `${powerWatt}W`, `Set`];
  if (budgetRaw) {
    teile.push(budgetRaw);
  }

  const query = teile.join(" ");

  return `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;
}
