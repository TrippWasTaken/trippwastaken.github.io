import { motion } from 'framer-motion';
import { useState } from 'react';

function MenuItem({ text, hoverText, linksTo }: { text: string; hoverText: string; linksTo: string }) {
  const [isHovered, setHovered] = useState(false);
  return (
    <li
      className="text-6xl overflow-hidden min-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative top-0 left-0 w-full"
        initial={{ y: 0 }}
        animate={{ y: isHovered ? '-100%' : '0' }}
        transition={{ type: 'tween', duration: 0.25 }}
      >
        <div className="py-2">{text}</div>
        <div className="absolute py-2">{hoverText}</div>
      </motion.div>
    </li>
  );
}

export default MenuItem;
