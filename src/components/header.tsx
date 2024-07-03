import { average } from 'color.js';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {}

const Header: React.FC<Props> = () => {
  const [ImgColor, setImgColor] = useState<undefined | string>();
  const [currImg, setCurrImage] = useState(0);

  const images = [
    '/src/assets/public/intro-photo.png',
    '/src/assets/public/DSC03821.png',
    '/src/assets/public/git-photo.png',
    '/src/assets/public/about-photo.png',
    '/src/assets/public/socials-photo.png',
    '/src/assets/public/work-photo.png'
  ];

  const categories = [{ text: 'About' }, { text: 'Photo' }, { text: 'Dev' }, { text: 'Video' }, { text: 'Music' }];
  const lightOrDark = (color: any) => {
    let r, g, b, hsp;
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5 ? 'light' : 'dark';
  };

  useEffect(() => {
    average(images[currImg], { format: 'hex' }).then((color) => {
      setImgColor(color);
    });

    setTimeout(() => nextImage(), 2000);
  }, [currImg]);

  const nextImage = () => {
    let newImage = currImg + 1;
    if (newImage === images.length) newImage = 0;
    setCurrImage(newImage);
  };
  return (
    <>
      <section className="min-h-full w-full max-w-[1920px] rounded-2xl select-none relative overflow-hidden flex flex-col ">
        <AnimatePresence initial mode="sync">
          <motion.div
            key={`color-${currImg}`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundColor: ImgColor ? ImgColor : 'rgb(0,0,0)',
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
          <AnimatePresence initial mode="sync">
            <ul className="flex flex-col justify-center gap-5">
              {categories.map((menuItem) => {
                return (
                  <motion.li className="text-6xl" key={menuItem.text}>
                    {menuItem.text}
                  </motion.li>
                );
              })}
            </ul>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Header;
