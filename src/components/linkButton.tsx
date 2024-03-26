import React from "react";
import { NavigationLinkType } from "../../global";
import { motion } from "framer-motion";
import Link from "next/link";
const LinkButton = ({
  textEng = "English Text",
  textJP = "日本語テキスト",
  navLink,
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
      <Link href={navLink as unknown as URL} className="w-full h-full">
        <div className="w-full h-full">
          <span className="absolute bottom-0 p-5 text-xl font-bold">
            {textEng}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default LinkButton;
