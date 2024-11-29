import React from 'react';

const Home = ({ onStart }) => {
  
  const homeStyle = {
    height: '100vh',  // 讓容器填滿整個視窗
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(/HHHHH.gif)',  // 設置背景圖的路徑
    backgroundSize: 'cover',  // 確保背景圖填滿容器
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: 'white',  // 文字顏色為白色
    textAlign: 'center',  // 使文字居中顯示
  };

  return (
    <div style={homeStyle}>
      <h1>大跳咬人刺蝟</h1>
      <h2>的冒險</h2>
      <button onClick={onStart}>遊戲開始</button>
    </div>
  );
};

export default Home;
