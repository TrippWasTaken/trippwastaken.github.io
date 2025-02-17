import { FC, useState } from 'react';
import UnderlineText from './underlineText';

const ContactLink: FC<{ linksTo: string; text: string; openNewTab?: boolean }> = ({
  linksTo = '#',
  text = 'noText',
  openNewTab = false
}) => {
  const [isHovered, setHovered] = useState<boolean>(false);
  return (
    <a
      {...(openNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      href={linksTo}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <UnderlineText hoverable isHovered={isHovered} />
      {text}
    </a>
  );
};

export default ContactLink;
