export function toPreviewText(html: string, maxLength = 280) {
  const plain = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength)}...`;
}
