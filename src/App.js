import React, { useRef, useState } from 'react';
import Home from './Home';
import Game from './Game';
import './App.css';  // 如果你有自定義的 CSS 檔案

const App = () => {
    // 使用 useRef 引用音樂元素
  const audioRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
//  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('音樂播放失敗：', error);
      });
    }
 // };
  return (
    <div className="App">
      {gameStarted ? (
        <Game />
      ) : (
        <Home onStart={() => setGameStarted(true)} />
      )}
       <audio ref={audioRef} loop autoPlay>
        <source src="/background.mp3" type="audio/mp3" />
        您的瀏覽器不支持 audio 元素。
      </audio>
    </div>
  );
};

export default App;
