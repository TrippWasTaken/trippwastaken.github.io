import { AnimationProps, motion } from 'framer-motion';
import { FC, useState } from 'react';
import { category } from '../types';

const MenuItem: FC<{ category: category }> = ({ category }) => {
  const [isHovered, setHovered] = useState(false);

  const { text, hoverText, linksTo } = category;

  const hoverLineAnim: AnimationProps['animate'] = {
    opacity: [0, 0, 1],
    transition: {
      repeat: Infinity,
      repeatType: 'mirror',
      duration: 0.5,
      ease: 'easeInOut'
    }
  };
  return (
    <li
      className="text-6xl overflow-hidden min-w-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a href={linksTo}>
        <motion.div
          className="relative top-0 left-0 w-full"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? '-100%' : '0' }}
          transition={{ type: 'tween', duration: 0.25 }}
        >
          <div className="py-2">{text}</div>
          <div className="absolute py-2">
            <span className="relative">
              {hoverText}
              <motion.div
                animate={isHovered ? hoverLineAnim : { opacity: 0 }}
                className="absolute -right-10 h-[4rem] bottom-0 bg-yellow-300 w-2 overflow-visible"
              />
            </span>
          </div>
        </motion.div>
      </a>
    </li>
  );
};

export default MenuItem;
