import { AnimatePresence, motion } from 'framer-motion';

const BASE_URL = import.meta.env.BASE_URL;

export const PhotoViewer = ({
  photos,
  selected,
  selectedChanged
}: {
  photos: string[];
  selected: number | null;
  selectedChanged: (reverse?: boolean) => void;
}) => {
  return (
    selected !== null && (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className=" aspect-square absolute h-full z-30 flex justify-center content-center m-5"
        >
          <div className="overflow-hidden aspect-square  h-full">
            <AnimatePresence mode="sync" initial>
              <motion.img
                initial={{ scale: 0.25 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.05 }}
                transition={{
                  duration: 0.15,
                  ease: 'easeIn'
                }}
                key={selected}
                className="shadow-lg object-cover  w-full h-full"
                src={`${BASE_URL}${photos[selected]}`}
              />
            </AnimatePresence>
          </div>
          <div
            className="left-0 absolute  z-40 w-1/2 h-full overflow-hidden cursor-pointer"
            onClick={() => selectedChanged(true)}
          />
          <div
            className="right-0 absolute  z-40 w-1/2 h-full overflow-hidden cursor-pointer"
            onClick={() => selectedChanged()}
          />
        </motion.div>
      </AnimatePresence>
    )
  );
};
