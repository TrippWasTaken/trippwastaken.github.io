import PageContainer from './pageContainer';

const AboutScreen = () => {
  return (
    <PageContainer>
      <div className="bg-zinc-200 absolute w-full h-full z-0" />
      <div className="text-zinc-900 z-10 self-start justify-self-start place-self-start w-full pt-20">
        <h3 className="text-[6rem] grid grid-flow-col">
          <div className="relative top-0">
            <span>WHO?</span>
            <span className="opacity-15 absolute text-nowrap top-10 left-10 font-extrabold">誰か</span>
          </div>
          <div className="relative top-0">
            <span>WHAT?</span>
            <span className="opacity-15 absolute text-nowrap top-10 left-10 font-extrabold">何か</span>
          </div>
          <div className="relative top-0">
            <span>WHERE?</span>
            <span className="opacity-15 absolute text-nowrap top-10 left-10 font-extrabold">どこに</span>
          </div>
        </h3>
      </div>
    </PageContainer>
  );
};

export default AboutScreen;
