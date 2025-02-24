type TextPart = {
  type: 'text' | 'url';
  text: string;
  displayText?: string;
};

function truncateUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

export function findUrls(text: string): TextPart[] {
  if (!text) return [{ type: 'text', text: '' }];
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts: TextPart[] = [];
  let lastIndex = 0;

  const matches = text.matchAll(urlRegex);
  for (const match of matches) {
    const url = match[0];
    const index = match.index!;

    if (index > lastIndex) {
      parts.push({
        type: 'text',
        text: text.slice(lastIndex, index)
      });
    }

    parts.push({
      type: 'url',
      text: url,
      displayText: truncateUrl(url)
    });

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      text: text.slice(lastIndex)
    });
  }

  return parts.length ? parts : [{ type: 'text', text: text }];
} 