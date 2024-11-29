import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const Game = () => {
  const gameContainerRef = useRef(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x66cc66, // 背景顏色：綠色
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // 禁用垂直重力
          debug: false // 開啟物理系統調試，顯示物理邊界
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);
    gameContainerRef.current.appendChild(game.canvas);
let hasHitTree = false;  // 用來防止重複對樹木加分

    let hedgehog;
    let coins;
    let trees; // 儲存樹的群組
    let isJumping = false;
    let jumpSpeed = 0;
    let score = 0; // 初始化分數變數
    let gamePaused = false; // 標記遊戲是否已暫停
let hasCollectedCoin = false; // 用來判斷是否已經加分
let inventory = []; // 用來儲存玩家獲得的道具
const maxInventorySize = 4; // 道具欄最大顯示的數量
let inventoryIcons = []; // 用來儲存道具圖標的陣列
let  jumpSound; // 在函數外定義 jumpSound 變數
let  coinSound; // 在函數外定義 jumpSound 變數
let  gainSound; // 在函數外定義 jumpSound 變數

let  fireSound; // 在函數外定義 jumpSound 變數
let fireEffect; // 火焰效果
let scoreText; // 火焰效果
let lastBiteTime = 0; // 用來記錄最後一次咬人的時間
const cooldownTime = 3500; // 咬人冷卻時間，這裡設置為10秒
let biteButton; // 用來引用咬人按鈕
let isBiting = false;  // 初始時不處於咬人狀態
let canBite = true;  // 初始時可以咬人


    function preload() {
      // 預載三隻不同的刺蝟圖片和金幣
      this.load.image('hedgehog1', '/images/hedgehog1.png');
      this.load.image('hedgehog2', '/images/hedgehog2.png');
      this.load.image('hedgehog3', '/images/hedgehog3.png');
      this.load.image('coin', '/images/coin.png'); // 金幣圖片
      this.load.image('tree', '/images/tree.png'); // 樹木背景裝飾
      this.load.image('grass', '/images/grass.png'); // 草地裝飾
      this.load.image('adventureBag', '/images/adventureBag.png'); // 冒險背包圖片
      this.load.image('companion', '/images/companion.png'); // 冒險夥伴圖片
      this.load.image('dimensionalBag', '/images/dimensionalBag.png'); // 異次元背包圖片
        this.load.image('fire', '/images/fire.gif'); // 火焰 GIF 圖片（請將這個文件換成你的火焰 GIF）

       // 加載音效
  this.load.audio('jumpSound', '/music/jump.wav'); // 假設音效檔案位置
    this.load.audio('coinSound', '/music/coin.wav'); // 假設音效檔案位置
        this.load.audio('gainSound', '/music/gain.wav'); // 假設音效檔案位置
                this.load.audio('fireSound', '/music/fire.wav'); // 假設音效檔案位置



    }

    function create() {
      // 設置攝影機邊界
      jumpSound = this.sound.add('jumpSound'); // 創建音效
      coinSound = this.sound.add('coinSound'); // 創建音效
      gainSound = this.sound.add('gainSound'); // 創建音效
        fireSound = this.sound.add('fireSound');

const gameWidth = this.cameras.main.width;
const isMobile = gameWidth <= 768; // 假設螢幕寬度小於等於768px為手機

      this.cameras.main.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

      // 加載背景圖片
// 設置背景圖片並調整為全屏顯示
this.add.image(0, 0, 'grass')
  .setOrigin(0)  // 設置圖片的原點為左上角
  .setScrollFactor(0)  // 禁用滾動，讓背景不隨著攝影機移動
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height);  // 設定圖片寬度和高度為畫面寬度和高度
  
  
      
      if (!selectedCharacter) {
        const selectText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, '選擇你的刺蝟角色', {
          fontSize: '48px',
          color: '#FFFFFF',
          align: 'center',
            wordWrap: { width: isMobile ? gameWidth * 0.8 : gameWidth * 0.6 , useAdvancedWrap: true} // 根據螢幕調整折行

        }).setOrigin(0.5);

        // 刺蝟角色選擇按鈕位置
const characterWidth = isMobile ? 100 : 150; // 手機顯示小一點
const gap = isMobile ? 80 : 120; // 手機時按鈕之間間隔小一點

        const hedgehog1 = this.add.image(this.cameras.main.centerX - 160, this.cameras.main.centerY, 'hedgehog1').setInteractive();
        const hedgehog2 = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'hedgehog2').setInteractive();
        const hedgehog3 = this.add.image(this.cameras.main.centerX + 160, this.cameras.main.centerY, 'hedgehog3').setInteractive();

        hedgehog1.on('pointerdown', () => {
          setSelectedCharacter('hedgehog1');
          startGame.call(this, 'hedgehog1');
        });
        hedgehog2.on('pointerdown', () => {
          setSelectedCharacter('hedgehog2');
          startGame.call(this, 'hedgehog2');
        });
        hedgehog3.on('pointerdown', () => {
          setSelectedCharacter('hedgehog3');
          startGame.call(this, 'hedgehog3');
        });

        return;
      }


      startGame.call(this, selectedCharacter);
    }

    // 外部函數：將樹添加到場景
    function addTree(xPosition) {
      const tree = this.physics.add.image(xPosition, this.cameras.main.centerY, 'tree');
      tree.setOrigin(0.5);
      trees.add(tree);
    }
     // 外部函數：將樹添加到場景
    function addcoin(xPosition) {
      const coin = this.physics.add.image(xPosition, this.cameras.main.centerY, 'coin');
      coin.setOrigin(0.5);
      coins.add(coin);
    }

    function startGame(character) {
      // 設置角色大小
  const isMobile = this.cameras.main.width <= 768; // 假設小於768為手機
  const scaleFactor = isMobile ? 0.5 : 1; // 手機時主角變小
      // 初始化角色
      hedgehog = this.physics.add.sprite(0, this.cameras.main.height - 60, character);
      hedgehog.setOrigin(0.5, 1);
      hedgehog.setBounce(0.2);
      hedgehog.setCollideWorldBounds(true);
      hedgehog.body.setAllowGravity(false);
      hedgehog.setDepth(999); // 設置刺蝟的深度，確保它總是顯示在最前面
  hedgehog.setScale(scaleFactor); // 根據螢幕大小調整大小


      
      // 創建透明按鈕
   // 創建咬人按鈕（透明綠色）
  biteButton = this.add.text(hedgehog.x+35, hedgehog.y , '咬人', {
    fontSize: '32px',
    color: '#00FF00',  // 初始為綠色
    fontFamily: 'Arial',
    backgroundColor: 'rgba(0, 255, 0, 0.3)', // 半透明綠色背景
    padding: { left: 10, right: 10, top: 5, bottom: 5 },
    align: 'center'
  }).setOrigin(0.5).setInteractive();

  // 設定按鈕的點擊事件
  biteButton.on('pointerdown', () => {
 
    isBiting = true;  // 設置為咬人狀態
    canBite = false;  // 設置為不可以咬人
    if (Date.now() - lastBiteTime >= cooldownTime) {  // 如果已經超過冷卻時間
    triggerBite.call(this);  // 執行咬人動作
    lastBiteTime = Date.now();  // 更新最後一次咬人的時間
    biteButton.setText('咬人');  // 更新按鈕文本
    biteButton.setStyle({ fill: '#00FF00' });  // 設定按鈕顏色為綠色透明
  } else {
    // 如果冷卻時間沒過，顯示冷卻中的狀態
    biteButton.setText('冷卻中');  // 按鈕顯示 '冷卻中'
    biteButton.setStyle({ fill: '#FF0000' });  // 設定為紅色透明
  }
 });

// 碰撞邏輯：刺蝟咬到樹木
this.physics.add.overlap(hedgehog, trees, (hedgehog, tree) => {
 
  });

  // 更新按鈕狀態
  this.time.addEvent({
    delay: 100, // 每 100 毫秒檢查一次按鈕狀態
    callback: () => {
      if (Date.now() - lastBiteTime < cooldownTime) {  // 如果冷卻時間還沒過
        // 按鈕變為透明紅色
        biteButton.setColor('#FF0000');
        biteButton.setBackgroundColor('rgba(255, 0, 0, 0.3)');  // 半透明紅色背景
      } else {
        // 按鈕變為透明綠色
        biteButton.setColor('#00FF00');
        biteButton.setBackgroundColor('rgba(0, 255, 0, 0.3)');  // 半透明綠色背景
      }
    },
    loop: true
  });

    // 創建火焰效果
  fireEffect = this.add.group(); // 用來儲存火焰效果

// 添加分數文本
       scoreText = this.add.text(20, 20, `Score: 0`, {
        fontSize: '32px',
        color: '#fff',
        fontFamily: 'Arial'
      });
      // 顯示道具欄（在分數下方）
  const inventoryBar = this.add.graphics();
  inventoryBar.fillStyle(0x000000, 0.5); // 半透明背景
  inventoryBar.fillRect(0, 50, this.cameras.main.width, 60); // 畫出道具欄背景

// 加入樹木，並設定為動態移動
      trees = this.physics.add.group();
      addTree.call(this, this.cameras.main.width); // 樹初始位置在螢幕右邊
      addTree.call(this, this.cameras.main.width + 390);
      addTree.call(this, this.cameras.main.width + 720);
      addTree.call(this, this.cameras.main.width + 1320);


      // 樹木向左移動並循環
      trees.getChildren().forEach(tree => {
        tree.setVelocityX(-260); // 向左移動的速度
        tree.setCollideWorldBounds(false); // 樹木不會與邊界碰撞
        tree.setImmovable(true); // 樹木不可移動
        tree.setGravityY(0); // 禁用垂直重力
        tree.y = (this.cameras.main.height - tree.height / 2)-60; // 固定樹的位置在底部
      });

      // 樹木循環移動
      this.time.addEvent({
        delay: 100, // 每隔 1 秒更新
        callback: () => {
          trees.getChildren().forEach(tree => {
            if (tree.x < -tree.width) { // 如果樹超出螢幕左側
              // 將樹移動到螢幕右側，並重新設置位置
              tree.x = this.cameras.main.width + tree.width;
            }
          });
        },
        loop: true,
      });


// 加入金幣，並設定為動態移動
      coins = this.physics.add.group();
      addcoin.call(this, this.cameras.main.width); // 樹初始位置在螢幕右邊
      addcoin.call(this, this.cameras.main.width + 420);
      addcoin.call(this, this.cameras.main.width + 820);
      addcoin.call(this, this.cameras.main.width + 1420);


      // 金幣向左移動並循環
      coins.getChildren().forEach(coin => {
        coin.setVelocityX(-200); // 向左移動的速度
        coin.setCollideWorldBounds(false); // 樹木不會與邊界碰撞
        coin.setImmovable(true); // 樹木不可移動
        coin.setGravityY(0); // 禁用垂直重力
        coin.y = (this.cameras.main.height - coin.height / 2)-50 -Math.random() * 350; // 固定樹的位置在底部
      });

      // 金幣循環移動
      this.time.addEvent({
        delay: 400, // 每隔 1 秒更新
        callback: () => {
          coins.getChildren().forEach(coin => {
            if (coin.x < -coin.width) { // 如果樹超出螢幕左側
              // 將樹移動到螢幕右側，並重新設置位置
              coin.x = this.cameras.main.width + coin.width;
            }
          });
        },
        loop: true,
      });







// 碰撞邏輯：刺蝟吃到金幣
this.physics.add.overlap(hedgehog, coins, (hedgehog, coin) => {
  if (hasCollectedCoin) return; // 如果已經加分過，則返回，避免重複加分

  console.log(`Hedgehog collected coin at x=${coin.x}, y=${coin.y}`);

  // 每次吃金幣時，增加 1 分
  // 播放跳躍音效
     coinSound.play();
  score += 1;
  scoreText.setText(`Score: ${score}`); // 更新分數顯示

  // 當分數達到 10、25、50 時顯示彈跳視窗
  if (score === 10 && !gamePaused) {
    gamePaused = true;
    showPopup.call(this, "刺蝟獲得冒險背包", "adventureBag");
    //addItemToInventory('adventureBag'); // 假設玩家獲得的道具名稱為 "adventureBag"
    addItemToInventory.call(this, 'adventureBag'); // 假設玩家獲得的道具名稱為 "adventureBag"


  } else if (score === 30 && !gamePaused) {
    gamePaused = true;
    showPopup.call(this, "刺蝟獲得冒險夥伴", "companion");
     addItemToInventory.call(this, 'companion'); // 假設玩家獲得的道具名稱為 "adventureBag"

  } else if (score === 50 && !gamePaused) {
    gamePaused = true;
    showPopup.call(this, "刺蝟獲得異次元空間背包", "dimensionalBag");
    addItemToInventory.call(this, 'dimensionalBag'); // 假設玩家獲得的道具名稱為 "adventureBag"
  }
  else if (score === 100 && !gamePaused) {
    gamePaused = true;
    showPopup.call(this, "遊戲不會結束，刺蝟的旅程會持續下去!");
  }

  // 移動金幣到右側並重新隨機設置 y 坐標
  coin.x = this.cameras.main.width + 50;
  coin.y = (this.cameras.main.height - 60) - Math.random() * 350;

  // 重新設置金幣的物理屬性
  coin.body.setVelocityX(-200);
  coin.body.setCollideWorldBounds(false);
  coin.body.setImmovable(true);
  coin.body.setAllowGravity(false);

  // 設置已經收集過金幣
  hasCollectedCoin = true;

  // 重置 `hasCollectedCoin`，避免下次碰撞加分
  this.time.delayedCall(100, () => {
    hasCollectedCoin = false;
  });
});

      //////////////////////////////////////////
      // 點擊螢幕讓刺蝟跳躍
      this.input.on('pointerdown', () => {
        if (!isJumping && !gamePaused) {
          isJumping = true;
          jumpSpeed = -35;
          hedgehog.setGravityY(300);
          // 播放跳躍音效
          jumpSound.play();
        }
      });
    }

    function update() {
      // 確保 coins 已經初始化，且不是 undefined
      if (coins) {
        // 刺蝟跳躍邏輯
        if (isJumping) {
          hedgehog.y += jumpSpeed;
          jumpSpeed += 1.8; // 模擬重力
          if (hedgehog.y >= this.cameras.main.height - 60) {
            hedgehog.y = this.cameras.main.height - 60;
            isJumping = false;
          }
        }

     
      }

        // 更新金幣的位置，實現循環移動
      if (coins) {
      coins.getChildren().forEach(coin => {
        if (coin.x < -coin.width) {
          coin.x = this.cameras.main.width + Math.random() * 500; // 將樹移到右側
        }
      });
    }
      // 更新樹的位置，實現循環移動
      if (trees) {
      trees.getChildren().forEach(tree => {
        if (tree.x < -tree.width) {
          tree.x = this.cameras.main.width + Math.random() * 500; // 將樹移到右側
        }
      });
    }
    }



  // 設置按鈕觸發
 function triggerBite() {
 

  // 播放火焰音效
  fireSound.play();
  
  // 在刺蝟前方產生火焰效果
  const fire = this.add.image(hedgehog.x + 100, hedgehog.y - 10, 'fire');
  fire.setScale(0.5);
     // 旋轉火焰 90 度
  fire.setAngle(-90);  // 或者 fire.setRotation(Phaser.Math.DegToRad(90));
  // 將火焰加入物理世界
  this.physics.add.existing(fire);
  
  // 設定火焰的速度
  fire.body.setVelocityX(300); // 火焰向右移動
  
  // 把火焰加到 fireEffect 群組
  fireEffect.add(fire);
  
  // 檢查火焰和樹木的碰撞
  this.physics.add.overlap(fireEffect, trees, (fire, tree) => {
     if (isBiting && !hasHitTree) {  // 只有在咬樹且未加分的情況下
    // 播放咬的音效
    fireSound.play();

    // 樹木從螢幕右邊重新出現
    tree.x = this.cameras.main.width + tree.width;
    tree.y = (this.cameras.main.height - tree.height / 2) - 60;

    // 重設樹的物理屬性
    tree.setVelocityX(-260);
    tree.setCollideWorldBounds(false);
    tree.setImmovable(true);
    tree.setGravityY(0);

    // 增加分數
    score += 1;
    scoreText.setText('分數: ' + score);  // 更新分數顯示

    // 設置已經對這棵樹加過分
    hasHitTree = true;
  }
  });

  // 每隔一定時間重置 hasHitTree，這樣就可以再次對樹加分
this.time.delayedCall(500, () => {
  hasHitTree = false;  // 讓玩家有機會再次加分
});
   // 在 2 秒後銷毀火焰
  this.time.delayedCall(1500, () => {
    fire.destroy(); // 2 秒後銷毀火焰
    canBite = true; // 10秒後可以再次咬人

  });
}
  // 添加樹木的函數
  function addTree(xPosition) {
    const tree = this.physics.add.image(xPosition, this.cameras.main.height - 60, 'tree');
    trees.add(tree);
    tree.setImmovable(true);
    tree.setGravityY(0);
  }

     function showPopup(message, imageKey) {
      // 顯示彈跳視窗
   // 背景
const popup = this.add.graphics();
popup.fillStyle(0x000000, 0.8); // 半透明黑色背景
popup.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
gainSound.play();

// 文字顯示，支持RWD折行
const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, message, {
  fontSize: '48px',
  color: '#FFFFFF',
  align: 'center',
  wordWrap: { width: this.cameras.main.width * 0.7   , useAdvancedWrap: true // 啟用進階折行模式
 } // 設定折行寬度為螢幕寬度的 80%
}).setOrigin(0.5);
console.log(this.cameras.main.width);
// 圖片顯示，設定寬度為視窗的 30%，長度自動調整
const image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 50, imageKey);

// 計算圖片寬度為視窗寬度的 30%
const imageWidth = this.cameras.main.width * 0.3;
image.setDisplaySize(imageWidth, image.height * (imageWidth / image.width));

// 按鈕文字，設定RWD效果
const button = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 150, '確定', {
  fontSize: '32px',
  color: '#FFFFFF',
  fontFamily: 'Arial'
}).setOrigin(0.5).setInteractive();
      button.on('pointerdown', () => {
        popup.clear();
        text.destroy();
        image.destroy();
        button.destroy();
        gamePaused = false; // 解除遊戲暫停
      });
    }


    function addItemToInventory(itemKey) {
  // 如果道具欄已滿，移除最舊的道具
  if (inventory.length >= maxInventorySize) {
    inventory.shift(); // 移除最舊的道具
  }

  // 新增獲得的道具
  inventory.push(itemKey);

  // 更新道具顯示
  updateInventoryDisplay.call(this); // 確保更新顯示時的上下文正確
}

function updateInventoryDisplay() {
  // 清除現有的道具顯示（如果有的話）
  inventoryIcons.forEach(icon => icon.destroy());
  inventoryIcons = [];

  // 根據道具欄更新顯示
  inventory.forEach((itemKey, index) => {
    const itemIcon = this.add.image(50 + index * 70, 80, itemKey); // 依次顯示道具圖標
    const originalHeight = itemIcon.height; // 獲取原始高度
const scaleFactor = 80 / originalHeight; // 計算縮放比例，使得高度變為 80

itemIcon.setScale(scaleFactor); // 設置縮放比例，讓高度為 80
inventoryIcons.push(itemIcon);
  });
}



    return () => {
      game.destroy(true);
    };
  }, [selectedCharacter]);

  return (
    <div>
      <div ref={gameContainerRef}></div>
    </div>
  );
};

export default Game;
