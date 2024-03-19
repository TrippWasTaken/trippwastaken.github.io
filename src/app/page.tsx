import HomeTextContainer from "@/components/homeTextContainer";
import PhotoContainer from "@/components/photoContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center p-0 m-0 relative">
      <HomeTextContainer />
      <PhotoContainer />
    </main>
  );
}
