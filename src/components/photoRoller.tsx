import { animate, AnimatePresence, AnimationPlaybackControls, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PhotoViewer } from './photoViewer';

function PhotoRoller({ photos, reverse = false }: { photos: string[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const photosTreated = reverse ? [...photos].reverse() : photos;

  const [selected, setSelected] = useState<number | null>(null);
  const xTranslate = useMotionValue(0);

  useEffect(() => {
    if (ref.current) {
      const container: HTMLDivElement = ref.current;
      const width = container.getBoundingClientRect().width;
      const finalPosition = -width / 2;

      controlsRef.current = animate(
        xTranslate,
        reverse ? [xTranslate.get(), finalPosition] : [finalPosition, xTranslate.get()],
        {
          ease: 'linear',
          duration: 100,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: 0 
        }
      );
      return controlsRef.current.stop;
    }
  }, [xTranslate, ref, reverse]);

  const controlSpeed = (newSpeed: number) => {
    if (controlsRef.current) {
      controlsRef.current.speed = newSpeed;
    }
  };

  const selectedChanged = (reverse: boolean = false) => {
    if (selected === 0 && reverse) {
      setSelected(photos.length - 1);
    }
    if (selected === photos.length - 1 && !reverse) {
      setSelected(0);
    } else {
      setSelected((prev) => (prev ?? 0) + (reverse ? -1 : 1));
    }
  };

  return (
    <>
      {selected !== null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="absolute w-full h-full bg-black z-20 p-10"
            onClick={() => setSelected(null)}
          />
        </AnimatePresence>
      )}
      <PhotoViewer photos={photos} selected={selected} selectedChanged={selectedChanged} />
      <div className="w-full h-1/3 relative overflow-hidden">
        <motion.div
          className="h-full w-max grid grid-flow-col absolute top-0 left-0"
          ref={ref}
          style={{ x: xTranslate }}
          onHoverStart={() => controlSpeed(0.5)}
          onHoverEnd={() => controlSpeed(1)}
        >
          {[...photosTreated, ...photosTreated].map((photo, i) => (
            <div className="aspect-square relative" key={i}>
              <img
                src={`/src/assets/public/${photo}`}
                className="object-cover w-full h-full absolute overflow-hidden"
                onClick={() => setSelected(() => photos.findIndex((i) => i === photo))}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
}

export default PhotoRoller;
