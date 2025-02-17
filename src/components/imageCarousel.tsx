import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';

const BASE_URL = import.meta.env.BASE_URL;

const ImageCarousel: FC<{ images: string[]; time?: number }> = ({ images = [], time = 3000 }) => {
  const [currImg, setCurrImage] = useState(0);
  useEffect(() => {
    let animationFrameId: number;
    let start: number;

    const updateTransitionState = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= time) {
        setCurrImage((prevState) => (prevState + 1) % images.length);
        start = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateTransitionState);
    };

    animationFrameId = requestAnimationFrame(updateTransitionState);

    return () => cancelAnimationFrame(animationFrameId);
  }, [images.length, time]);

  return (
    <div className="overflow-hidden relative flex-1 rounded-2xl min-h-full object-fit lg:m-5">
      <AnimatePresence initial mode="sync">
        <motion.img
          key={`image-${currImg}`}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '50%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute lg:-top-1/2"
          src={BASE_URL + images[currImg]}
          alt="dynamic background image"
        />
      </AnimatePresence>
    </div>
  );
};

export default ImageCarousel;
