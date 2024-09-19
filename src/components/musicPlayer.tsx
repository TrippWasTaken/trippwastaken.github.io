import { useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import ReactPlayer from 'react-player';

const MusicPlayer = ({ trackList }: { trackList: { name: string; src: string }[] }) => {
  const [currSong, setCurrSong] = useState(0);
  const [currSongDetails, setCurrSongDetails] = useState({ duration: '00:00' });
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const ref = useRef<ReactPlayer | null>(null);

  const getCurrSongDetails = () => {
    if (ref.current) {
      const duration = ref.current.getDuration();

      const mins = Math.floor(duration / 60);

      const seconds = duration - mins * 60;

      console.log(mins, seconds);

      const time = `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setCurrSongDetails((prev) => ({ ...prev, duration: time }));
    }
  };

  const changeCurrSong = () => {
    setCurrSong((prev) => (prev + 1 < trackList.length ? prev + 1 : 0));
  };

  const mouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();

    mouseX.set(((e.clientX - left) / width) * -20);
    mouseY.set(((e.clientY - top) / height) * -20);
  };

  const onClickCard = (e, nativeEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();

    console.log(nativeEvent.offsetX / width);

    if (nativeEvent.offsetX / width > 0.5) {
      console.log('up');
    } else {
      console.log('down');
    }
  };

  const onClickYT = () => {
    if (ref.current) {
      setPlaying((p) => !p);
    }
  };
  return (
    <motion.div
      className="sm: w-full w-5/6 max-w-[800px] max-h-full aspect-square shadow-2xl bg-red-400 justify-center items-center relative mt-10"
      onClick={(e) => onClickCard(e, e.nativeEvent)}
      onMouseMove={mouseMove}
      onMouseLeave={() => {
        animate(mouseX, 0);
        animate(mouseY, 0);
      }}
      style={{
        translateX: mouseX,
        translateY: mouseY
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0 p-5">
        <div className="place-self-start">
          Track: <span className="font-bold">{trackList[currSong].name}</span>
        </div>
        <div className="place-self-end self-start">
          Duration:<span className="font-bold">{currSongDetails.duration}</span>
        </div>
        <div className="self-end">
          <a href="https://soundcloud.com/solyeong" target="_blank" rel="noreferrer noopener">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              width="1em"
              height="1em"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 20 20"
              style={{ fontSize: '2rem' }}
            >
              <path
                fill="currentColor"
                d="M.672 13.055L1 11.654l-.328-1.447c-.009-.043-.092-.076-.191-.076c-.102 0-.184.033-.191.076L0 11.654l.289 1.4c.008.045.09.076.191.076c.1.001.183-.03.192-.075m2.051.777L3 11.668L2.723 8.32c-.009-.084-.114-.152-.239-.152c-.127 0-.233.068-.238.152L2 11.668l.246 2.164c.006.086.111.152.238.152c.125 0 .23-.066.239-.152m2.045-.035L5 11.67l-.232-4.457c-.006-.106-.129-.188-.282-.188s-.275.082-.281.188L4 11.67l.205 2.129c.006.103.129.186.281.186c.153-.001.276-.083.282-.188m2.042-.031L7 11.67l-.19-4.49c-.005-.123-.146-.221-.32-.221c-.176 0-.316.098-.321.221L6 11.67l.17 2.096c.004.123.145.221.32.221c.174-.001.315-.096.32-.221m2.04-.028L9 11.672l-.15-5.149c-.004-.142-.164-.255-.358-.255s-.354.115-.357.256L8 11.67l.135 2.068c.003.141.163.256.357.256s.354-.113.358-.256m1.427.258l7.145.004C18.846 14 20 12.883 20 11.506s-1.154-2.492-2.578-2.492c-.353 0-.689.07-.996.193c-.205-2.246-2.153-4.008-4.529-4.008a4.8 4.8 0 0 0-1.648.297c-.196.074-.247.148-.249.295v7.91a.306.306 0 0 0 .277.295"
              ></path>
            </svg>
          </a>
        </div>
        <div className="place-self-end">
          Next:
          <span className="font-bold cursor-pointer" onClick={() => changeCurrSong()}>
            {currSong + 1 < trackList.length ? trackList[currSong + 1].name : trackList[0].name}
          </span>
        </div>
      </div>
      <div
        className="z-10 absolute w-2/3 -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2"
        onClick={() => onClickYT()}
      >
        <ReactPlayer
          ref={ref}
          url={trackList[currSong].src}
          style={{ aspectRatio: '1/1', pointerEvents: 'none' }}
          width={'auto'}
          height={'auto'}
          playing={playing}
          volume={volume}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                disablekb: 0
              }
            }
          }}
          onReady={() => getCurrSongDetails()}
        />
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
