import type { GameData } from './types';
import gameData from './data/play-by-play.json';
import PlayByPlayFeed from './components/PlayByPlayFeed';
import TeamAggregates from './components/TeamAggregates';
import SubstitutionImpactAnalyzer from './components/SubstitutionImpactAnalyzer';
import './App.css';


function App() {
  const actions = (gameData as GameData).actions;

  console.log(actions); // Check browser console

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">NBA Play-by-Play Viewer</h1>
        <PlayByPlayFeed actions={actions} />
        <TeamAggregates actions={actions} />
        <SubstitutionImpactAnalyzer actions={actions} />
      </div>
    </div>
  );
}

export default App
