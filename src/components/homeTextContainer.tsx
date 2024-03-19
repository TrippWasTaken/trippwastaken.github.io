import React from "react";

const HomeTextContainer = () => {
  const textSharedClasses = "absolute font-bold text-2xl p-5";
  return (
    <div className="absolute h-screen w-screen">
      <h1 className={`${textSharedClasses} top-0 left-0`}>Tripp.Media</h1>
      <div className={`${textSharedClasses} bottom-0 right-0`}>
        トリップ。メディア
      </div>
    </div>
  );
};

export default HomeTextContainer;
