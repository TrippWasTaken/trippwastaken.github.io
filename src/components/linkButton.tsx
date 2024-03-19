import React from "react";
import { NavigationLinkType } from "../../global";
import { motion } from "framer-motion";
const LinkButton = ({
  textEng = "English Text",
  textJP = "日本語テキスト",
  navLink = null,
  gridProperties,
}: NavigationLinkType) => {
  return (
    <motion.div
      transition={{
        ease: "easeInOut",
        duration: 0.15,
      }}
      whileHover={{ scale: 1.025 }}
      className={`relative rounded-md w-full h-full bg-black bg-opacity-50 cursor-pointer ${gridProperties}`}
    >
      <span className="absolute bottom-0 p-5 text-xl font-bold">{textEng}</span>
    </motion.div>
  );
};

export default LinkButton;
