import MusicPlayer from './musicPlayer';
import PageContainer from './pageContainer';

const MusicScreen = () => {
  const songLinks = [
    { name: 'Life and Its End', src: 'https://www.youtube.com/watch?v=dxVhAFNxRnM' },
    { name: '初めの終わり', src: 'https://www.youtube.com/watch?v=iSkoAhu__jM ' },
    { name: 'Moments From A Better Past', src: 'https://www.youtube.com/watch?v=aVxWZaoSrMQ' },
    { name: 'Blissful Existence Away From It All', src: 'https://youtu.be/NNV1BNl-9bs?si=UNjvRa5GlZHiPE3o' },
    { name: 'Seconds Before Its All Gone', src: 'https://www.youtube.com/watch?v=BWdVxyfnZEw' }
  ];
  return (
    <PageContainer>
      <main className="w-full h-screen flex flex-col items-center p-12" id="Music">
        <h1 className="text-5xl">
          I make music under the name <span className="font-bold">Solyeong</span>
        </h1>

        <MusicPlayer trackList={songLinks} />
      </main>
    </PageContainer>
  );
};

export default MusicScreen;
