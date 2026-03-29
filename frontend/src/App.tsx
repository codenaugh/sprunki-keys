import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/MainMenu';
import { CharacterSelect } from './components/CharacterSelect';
import { LevelSelect } from './components/LevelSelect';
import { GamePage } from './components/GamePage';
import { GameOver } from './components/GameOver';
import { Settings } from './components/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/characters" element={<CharacterSelect />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/play/:levelId" element={<GamePage />} />
        <Route path="/results" element={<GameOver />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
