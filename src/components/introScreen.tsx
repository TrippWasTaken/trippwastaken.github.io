import { useMediaQuery } from 'react-responsive';
import ImageCarousel from './imageCarousel';
import PageContainer from './pageContainer';

const IntroScreen = () => {
  const lineOneImages = ['1.png', '2.png', '10.png'];
  const lineTwoImages = ['9.png', '4.png', '5.png'];
  const lineThreeImages = ['6.png', '7.png', '8.png'];

  const isMinWidth = useMediaQuery({
    query: '(min-width: 1028px)'
  });
  const commonClasses = 'flex flex-row gap-5 ';

  return (
    <PageContainer>
      <div className="topographic-bg absolute h-full w-full" />
      {isMinWidth && (
        <h2 className="text-[8rem] font-bold w-[1028px] relative ">
          <div className={commonClasses}>
            <span>Creating</span>
            <ImageCarousel images={lineOneImages} time={3000} />
          </div>
          <div className={commonClasses}>
            <ImageCarousel images={lineTwoImages} time={3500} />
            <span className="bg-yellow-300  rounded-xl text-zinc-900 lg:m-5">a bit of</span>
          </div>
          <div className={commonClasses}>
            <span>everything</span>
            <ImageCarousel images={lineThreeImages} time={4000} />
          </div>
        </h2>
      )}

      {!isMinWidth && (
        <h2 className="text-6xl  md:text-8xl font-bold w-full relative p-10 text-zinc-900">
          <span className="absolute z-10 top-0 right-4 pr-4 pl-4 bg-yellow-300 rounded-xl">Creating a bit</span>
          <div className="aspect-square">
            <ImageCarousel images={[...lineOneImages, ...lineTwoImages, ...lineThreeImages]} time={3500} />
          </div>
          <span className="absolute z-10 bottom-0 left-4 pr-4 pl-4 bg-yellow-300  rounded-xl">of everything</span>
        </h2>
      )}
    </PageContainer>
  );
};

export default IntroScreen;
