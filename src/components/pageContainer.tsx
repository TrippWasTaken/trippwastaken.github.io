import { FC, PropsWithChildren } from 'react';

const PageContainer: FC<PropsWithChildren> = ({ children }) => {
  return <section className="w-full min-h-screen z-0 relative flex  items-center justify-center">{children}</section>;
};

export default PageContainer;
