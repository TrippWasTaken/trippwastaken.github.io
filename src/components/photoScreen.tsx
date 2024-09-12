import PageContainer from './pageContainer';
import PhotoRoller from './photoRoller';

function PhotoScreen() {
  const photos = [
    '1.png',
    '2.png',
    '3.png',
    '4.png',
    '5.png',
    '6.png',
    '7.png',
    '8.png',
    '9.png',
    '10.png',
    '11.png',
    '12.png',
    '13.png',
    '14.png',
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg',
    '6.jpg',
    '7.jpg'
  ];
  return (
    <PageContainer>
      <main className="w-full h-screen flex flex-col items-center justify-center">
        <PhotoRoller photos={photos} />
        <h1 className="h-1/3 text-4xl flex items-center">Lately Ive liked taking photos so heres a few</h1>
        <PhotoRoller photos={photos} reverse />
      </main>
    </PageContainer>
  );
}

export default PhotoScreen;
