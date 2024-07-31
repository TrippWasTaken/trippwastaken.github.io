import { motion } from 'framer-motion';
import { useState } from 'react';
import { category } from '../types';

function MenuItem({ category }: { category: category }) {
  const [isHovered, setHovered] = useState(false);

  const { text, hoverText, linksTo } = category;
  return (
    <li
      className="text-6xl overflow-hidden min-w-full relative"
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
        <div className="absolute py-2">
          <span className="relative">
            {hoverText}{' '}
            <motion.div
              transition={{ repeat: Infinity, repeatType: 'loop', duration: 0.5 }}
              // initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -right-10 w-10 bg-yellow-300 h-4"
            />
          </span>
        </div>
      </motion.div>
    </li>
  );
}

export default MenuItem;
