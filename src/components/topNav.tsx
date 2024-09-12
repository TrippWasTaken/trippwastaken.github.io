import { FC, useState } from 'react';
import { categories } from '../types';
import MenuItem from './menuItem';
import UnderlineText from './underlineText';
import { AnimatePresence, motion } from 'framer-motion';
import ContactLinks from './contactLinks';

const TopNav: FC = () => {
  const [isHovered, setHovered] = useState<boolean>(false);
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const categories: categories = [
    { text: 'About', hoverText: '自分について', linksTo: '#About' },
    { text: 'Photo', hoverText: '写真', linksTo: '#' },
    { text: 'Dev', hoverText: 'デベロップメント', linksTo: '#' },
    { text: 'Video', hoverText: '動画', linksTo: '#' },
    { text: 'Music', hoverText: '音楽', linksTo: '#' }
  ];

  const contactAnimText = [
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡',
    'Contact連絡'
  ];

  return (
    <>
      <div className="w-full flex flex-row justify-between h-fit p-10 z-[55] fixed">
        <h1 className=" text-4xl font-semibold">
          <span className="relative">
            TRIPP
            <UnderlineText />
          </span>

          <span className="text-xl font-extralight">.media</span>
        </h1>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="relative p-0 m-0 h-fit"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!isMenuOpen ? 'Menu' : 'Close'}
          <span>
            <UnderlineText hoverable isHovered={isHovered} />
          </span>
        </button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              exit={{ x: '-100%' }}
              animate={{
                x: 0
              }}
              transition={{ type: 'tween', ease: 'circInOut' }}
              className="fixed w-full h-screen p-0 m-0 z-40"
            >
              <motion.div
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                animate={{
                  opacity: 0.25
                }}
                onClick={() => isMenuOpen && setMenuOpen(false)}
                transition={{ type: 'tween', ease: 'circInOut' }}
                className="absolute w-full h-screen p-0 m-0 bg-transparent z-0 cursor-pointer"
              />
              <section className="relative w-3/4 h-full flex flex-col justify-center content-center items-center bg-zinc-800 select-none">
                <motion.ul
                  initial={{ x: '-100%' }}
                  exit={{ x: '-100%' }}
                  animate={{
                    x: 0
                  }}
                  transition={{ type: 'tween', ease: 'circInOut' }}
                  className="w-full flex justify-center content-center items-center"
                >
                  <div className="p-5 w-full">
                    {categories.map((item) => (
                      <MenuItem category={item} key={item.text} />
                    ))}
                  </div>
                </motion.ul>
                <div className="w-full h-1 bg-yellow-300 mt-5 mb-5" />

                <div className=" overflow-hidden w-full">
                  <motion.div className="flex flex-row overflow-show gap-4 flex-nowrap">
                    <p className=" text-8xl opacity-10 text-nowrap m-0 p-0">
                      {contactAnimText.map((text, index) => (
                        <motion.span
                          key={index}
                          className="inline-block m-0 p-0 whitespace-pre"
                          transition={{
                            translateX: { repeat: Infinity, duration: 10, repeatType: 'loop', ease: 'linear' }
                          }}
                          initial={{ translateX: '0%' }}
                          animate={{ translateX: '-100%' }}
                        >
                          {text}
                        </motion.span>
                      ))}
                    </p>
                  </motion.div>
                </div>

                <ContactLinks />
              </section>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              animate={{
                opacity: 0.25
              }}
              transition={{ type: 'tween', ease: 'circInOut' }}
              className="absolute w-full h-screen p-0 m-0 bg-slate-100 z-10 blur-xl cursor-pointer"
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
