import { GameData } from './types';
import gameData from './data/play-by-play.json';
import './App.css';


function App() {
  const actions = (gameData as GameData).actions;

  console.log(actions); // Check browser console

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">NBA Play-by-Play Viewer</h1>
    </div>
  );
}

export default App
