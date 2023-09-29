import React from 'react';

function TruncateText({ text, maxWords }) {
  const words = text.split(' ');

  if (words.length <= maxWords) {
    return <p>{text}</p>;
  }

  const truncatedText = words.slice(0, maxWords).join(' ');
  const ellipsis = '...';

  return (
    <p>
      {truncatedText} {ellipsis}
    </p>
  );
}

export default TruncateText;
