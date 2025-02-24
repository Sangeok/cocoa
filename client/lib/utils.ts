type TextPart = {
  type: 'text' | 'url';
  text: string;
};

export function findUrls(text: string): TextPart[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts: TextPart[] = [];
  let lastIndex = 0;

  text.replace(urlRegex, (url, index) => {
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        text: text.slice(lastIndex, index)
      });
    }
    parts.push({
      type: 'url',
      text: url
    });
    lastIndex = index + url.length;
    return url;
  });

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      text: text.slice(lastIndex)
    });
  }

  return parts;
} 