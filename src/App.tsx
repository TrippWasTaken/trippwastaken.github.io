import './App.css';
import AboutScreen from './components/aboutScreen';
import IntroScreen from './components/introScreen';

import TopNav from './components/topNav';

function App() {
  return (
    <div className="min-h-screen min-w-full bg-zinc-800 text-zinc-100 justify-center">
      <TopNav />
      <IntroScreen />
      <AboutScreen />
    </div>
  );
}

export default App;
