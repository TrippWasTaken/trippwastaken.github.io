import { average } from 'color.js';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuItem from './menuItem';
import { lightOrDark } from '../utils/lightOrDark';
import TopNav from './topNav';

interface Props {}
type Hex = string;
type Rgb = [r: number, g: number, b: number];
type Output = Hex | Rgb | (Hex | Rgb)[] | string;

const Header: React.FC<Props> = () => {
  const [ImgColor, setImgColor] = useState<undefined | Output>();
  const [currImg, setCurrImage] = useState(0);

  const images = useMemo(
    () => [
      '/src/assets/public/intro-photo.png',
      '/src/assets/public/DSC03821.png',
      '/src/assets/public/git-photo.png',
      '/src/assets/public/about-photo.png',
      '/src/assets/public/socials-photo.png',
      '/src/assets/public/work-photo.png'
    ],
    []
  );

  const categories = [
    { text: 'About', hoverText: '自分について', linksTo: '#' },
    { text: 'Photo', hoverText: '写真', linksTo: '#' },
    { text: 'Dev', hoverText: 'デベロップメント', linksTo: '#' },
    { text: 'Video', hoverText: '動画', linksTo: '#' },
    { text: 'Music', hoverText: '音楽', linksTo: '#' }
  ];

  useEffect(() => {
    average(images[currImg], { format: 'hex' }).then((color) => setImgColor(color));
  }, [currImg, images]);

  useEffect(() => {
    let animationFrameId: number;
    let start: number;

    const updateTransitionState = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= 3000) {
        setCurrImage((prevState) => (prevState + 1) % images.length);
        start = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateTransitionState);
    };

    animationFrameId = requestAnimationFrame(updateTransitionState);

    return () => cancelAnimationFrame(animationFrameId);
  }, [images.length]);

  return (
    <>
      <section className="min-h-full w-full rounded-2xl select-none relative overflow-hidden flex flex-col ">
        <AnimatePresence initial mode="sync">
          <motion.div
            key={`color-${currImg}`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundColor: ImgColor ? ImgColor.toString() : 'rgb(0,0,0)',
              color: ImgColor && lightOrDark(ImgColor) === 'light' ? 'rgb(0,0,0)' : 'rgb(255,255,255)'
            }}
          ></motion.div>
        </AnimatePresence>

        <div className="relative w-fit mt-0 mb-0 m-auto">
          <h1 className="text-[12rem] m-0 p-0 font-semibold">Tripp</h1>
          <h2 className="absolute bottom-12 right-0 bg-blend-difference">.Media</h2>
        </div>
        <div className="relative flex-1 overflow-hidden flex p-5 gap-5">
          <div className="h-full rounded-3xl aspect-square overflow-hidden relative">
            <AnimatePresence initial mode="sync">
              <motion.img
                key={`image-${currImg}`}
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: '50%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute top-0 left-0 overflow-hidden aspect-square h-full"
                src={images[currImg]}
                alt="dynamic background image"
              />
            </AnimatePresence>
            <h3 className="absolute text-6xl bottom-1/2 pl-5">
              I make <span className=" bg-black font-semibold p-3 -ml-1.5 rounded-2xl">things</span>
            </h3>
          </div>

          <ul className=" flex flex-1 flex-col">
            {categories.map((menuItem) => {
              return (
                <MenuItem
                  key={menuItem.text}
                  text={menuItem.text}
                  hoverText={menuItem.hoverText}
                  linksTo={menuItem.linksTo}
                />
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Header;
