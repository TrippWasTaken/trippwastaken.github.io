import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function PhotoRoller({ photos, reverse = false }: { photos: string[]; reverse?: boolean }) {
  const NORMAL_SPEED = 100;
  const SLOW_SPEED = NORMAL_SPEED * 2.5;
  const ref = useRef<HTMLDivElement | null>(null);
  const photosTreated = reverse ? [...photos].reverse() : photos;

  // const [zoomed, setZoomed] = useState(false);
  const [speed, setSpeed] = useState(NORMAL_SPEED);
  const xTranslate = useMotionValue(0);

  useEffect(() => {
    if (ref.current) {
      const container: HTMLDivElement = ref.current;
      const width = container.scrollWidth;
      const finalPosition = -width / 2;

      const controls = animate(
        xTranslate,
        reverse ? [finalPosition, xTranslate.get()] : [xTranslate.get(), finalPosition],
        {
          ease: 'linear',
          duration: speed,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: 0
        }
      );

      return controls.stop;
    }
  }, [xTranslate, ref, reverse, speed]);

  const variants = {};

  return (
    <div className="w-full h-1/3 relative overflow-hidden">
      <motion.div
        className="w-full h-full grid grid-flow-col absolute"
        variants={variants}
        ref={ref}
        style={{ x: xTranslate }}
        onHoverStart={() => setSpeed(SLOW_SPEED)}
        onHoverEnd={() => setSpeed(NORMAL_SPEED)}
      >
        {[...photosTreated, ...photosTreated].map((photo, i) => (
          <div className="aspect-square relative" key={i}>
            <img src={`/src/assets/public/${photo}`} className="object-cover w-full h-full absolute overflow-hidden" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default PhotoRoller;
