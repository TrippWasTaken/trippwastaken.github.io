import { FC } from 'react';
import { motion } from 'framer-motion';

const UnderlineText: FC<{ hoverable?: boolean; isHovered?: boolean }> = ({ hoverable = false, isHovered = false }) => {
  return (
    <motion.span
      initial={{ width: '100%' }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
      className="absolute h-0.5 bg-yellow-300 bottom-0 left-0"
      {...(hoverable && {
        animate: { width: isHovered ? '100%' : '0' }
      })}
    />
  );
};

export default UnderlineText;
