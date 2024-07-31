import { FC, PropsWithChildren } from 'react';

interface Props {
  image: string;
}

const PageContainer: FC<PropsWithChildren<Props>> = ({ image, children }) => {
  return (
    <section className="w-full h-full z-30 relative ">
      <div className="w-1/2">
        <img
          className="absolute top-0 left-0 overflow-hidden aspect-square h-full"
          alt="background image"
          src={image}
        />
      </div>
      {children}
    </section>
  );
};

export default PageContainer;
