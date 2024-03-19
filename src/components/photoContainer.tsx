"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import LinkButton from "./linkButton";

const PhotoContainer = () => {
  return (
    <motion.div
      whileHover={{ scale: 1 }}
      className="w-auto h-[95vh] bg-white aspect-[5/6] rounded-md flex justify-center relative"
    >
      <motion.div
        whileHover={{ opacity: 1 }}
        className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 p-4 absolute opacity-0"
      >
        <LinkButton textEng="About" textJP="テスト" navLink={"#"} />
        <LinkButton
          textEng="Work"
          textJP="テスト"
          navLink={"#"}
          gridProperties={"col-span-2 row-span-2"}
        />
        <LinkButton
          textEng="Socials"
          textJP="テスト"
          navLink={"#"}
          gridProperties={"row-span-2 col-span 1"}
        />
        <LinkButton textEng="Music" textJP="テスト" navLink={"#"} />
        <LinkButton textEng="Git" textJP="テスト" navLink={"#"} />
      </motion.div>
      <div className="w-full h-auto p-2">
        <Image
          objectFit="contain"
          src={"/intro-photo.png"}
          height={0}
          width={0}
          sizes="100%"
          alt="Image of man standing in the dark"
          className="w-auto h-auto rounded-md overflow-hidden border-black border"
        />
      </div>
    </motion.div>
  );
};

export default PhotoContainer;
