"use client";
import { motion } from "framer-motion";
import LinkButton from "@/components/linkButton";

export default function Home() {
  return (
    <motion.div
      whileHover={{ opacity: 1 }}
      className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 p-4 absolute opacity-0 z-10"
    >
      <LinkButton textEng="About" textJP="テスト" navLink={"/about"} />
      <LinkButton
        textEng="Work"
        textJP="仕事"
        navLink={"/work"}
        gridProperties={"col-span-2 row-span-2"}
      />
      <LinkButton
        textEng="Socials"
        textJP="ソーシャルズ"
        navLink={"/music"}
        gridProperties={"row-span-2 col-span 1"}
      />
      <LinkButton textEng="Music" textJP="曲" navLink={"/socials"} />
      <LinkButton textEng="Git" textJP="ギトハーブ" navLink={"/git"} />
    </motion.div>
  );
}
