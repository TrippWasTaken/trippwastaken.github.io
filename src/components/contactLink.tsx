import { FC, useState } from 'react';
import UnderlineText from './underlineText';

const ContactLink: FC<{ linksTo: string; text: string }> = ({ linksTo = '#', text = 'noText' }) => {
  const [isHovered, setHovered] = useState<boolean>(false);
  return (
    <a href={linksTo} className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <UnderlineText hoverable isHovered={isHovered} />
      {text}
    </a>
  );
};

export default ContactLink;
