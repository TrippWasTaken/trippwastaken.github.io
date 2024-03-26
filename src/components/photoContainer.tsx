"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type props = {
  children: ReactNode;
};

interface Image {
  src: string;
  alt: string;
}

interface Images {
  [key: string]: Image;
}

const PhotoContainer = ({ children }: props) => {
  const images: Images = {
    "/": {
      src: "/intro-photo.png",
      alt: "Image of man standing in the dark",
    },
    "/about": {
      src: "/about-photo.png",
      alt: "Image of a sticker from an unkown group",
    },
    "/git": {
      src: "/git-photo.png",
      alt: "Image of a man alone in the night city",
    },
    "/music": {
      src: "/music-photo.png",
      alt: "Image of man waving people across the road",
    },
    "/socials": {
      src: "/socials-photo.png",
      alt: "Image of carts going up a mountain in the fog",
    },
    "/work": {
      src: "/work-photo.png",
      alt: "Image of trains coming out a tunnel",
    },
  };
  const currentPath = usePathname() as keyof Image;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeIn" }}
      className="w-auto h-[95vh] bg-white aspect-[5/6] rounded-md flex justify-center relative overflow-hidden"
    >
      {children}
      <div className="w-full h-auto p-2 absolute z-0">
        <AnimatePresence initial mode="wait">
          <motion.img
            initial={{ y: 750, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -750, opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            key={currentPath}
            src={images[currentPath].src}
            alt={images[currentPath].alt}
            className="w-auto h-auto rounded-md overflow-hidden border-black border"
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PhotoContainer;
