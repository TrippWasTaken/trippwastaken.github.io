import PageContainer from './pageContainer';

const BASE_URL = import.meta.env.BASE_URL;

const AboutScreen = () => {
  return (
    <PageContainer>
      <div className="bg-zinc-200 absolute w-full h-full z-0" id="About" />
      <div className="text-zinc-900 z-10 self-start w-full pt-20">
        <h3 className="text-[6rem] flex flex-col lg:flex-row lg:justify-evenly w-full items-center">
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
        <div className="w-full p-10 flex flex-col gap-10 justify-center items-center lg:flex-row">
          <div className="w-full lg:w-1/2 overflow-hidden rounded-3xl relative">
            <div className="aspect-square full overflow-hidden rounded-3xl relative">
              <img className="w-full absolute bottom-0" src={BASE_URL + 'public/about-me.jpg'} alt="image of me" />
            </div>
          </div>

          <div className="lg:w-1/2 w-full lg:pl-5 lg:pr-5">
            <h1 className=" text-6xl">
              By Profession Im a <span className="font-bold">Software Developer</span>
            </h1>
            <div className="text-l">
              My most recent fulltime position was also my first at <a>Continuous Software</a> working on their
              <a>Aangine</a> platform. Here I implemented a lot of game changing features for the app such as
              integrating DHTMLX Kanban with their Gantt chart allowing all the customers to interact and edit scenarios
              in a whole new light. One of my proudest achievements was an issue solved alongside my tech lead at the
              time where we managed to eliminate a serious loading issue that plagued the app with 2-4 minute wait times
              between comparing scenarios, we managed to get that loading time down to just 5-15 seconds. The fix ended
              up being a 1 liner haha but as we went on I refactored the entire page within the app leading to a much
              better DX too for devs working on it moving forward. Since then Ive went on a working holiday in Japan but
              after some doubts Ive landed back in Ireland after almost a year there. While I want to come back I want
              to get back into my dev career and really maximise my skillset before setting on Tokyo. While I was
              searching for work back in Ireland, I worked with PattyMayo a big youtuber within the bounty hunter
              community on youtube. For them I created their dream FiveM GTA RP server full with discord integration a
              website with all the info users need and a shop thats easily edited by the server managers via the Zap
              Hosting Tabex platform.
              <br />
              <br />
              Now I am working a Software Engineer at Experlogix on some of their latest CPQ solutions as part of a new
              team focusing on new products.
              <br />
              <br />
              While dev is my Profession. Ive dabbled my toes in video work and photography too, doing multiple works
              for local Irish artists such as <strong>Jon Lui</strong> and <strong>Why-Axis</strong>. In my spare time
              Im also a Breakcore music producer along trying different genres such as metal, Trap and Vocaloid
              production. This site aims to highlight everything Ive done and continue to do but if you wish to contact
              me directly you can do so at <a href="mailto:Konrad.Knecht@gmail.com">Konrad.Knecht@gmail.com</a> other
              links can be found just below so feel free to take a scroll around :)
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AboutScreen;
