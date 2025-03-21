// 游戏状态管理
let currentRound = 1;
let totalScore = 0;
let correctAnswer; // 'top' 或 'bottom'
let realImages = [];
let aiImages = [];
let usedReal = new Set();
let usedAi = new Set();

// 界面元素
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen')
};

// 初始化游戏
async function initGame() {
  // 加载图片列表
  realImages = await loadImageList('real_images');
  aiImages = await loadImageList('ai_images');

  if (realImages.length === 0 || aiImages.length === 0) {
    alert('图片加载失败，请检查图片文件');
    return;
  }

  // 绑定事件
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', handleChoice);
  });
}

// 开始新游戏
function startGame() {
  screens.start.classList.remove('active');
  screens.game.classList.add('active');
  newRound();
}

// 生成新关卡
// 生成新关卡
function newRound() {
  /**
   * 关卡初始化逻辑：
   * 1. 随机分配正确答案位置（top/bottom）
   * 2. 更新界面回合数和得分显示
   * 3. 重置卡片选择状态
   * 4. 加载真人/AI图片
   */
  
  // 随机生成正确答案位置（50%概率在顶部或底部）
  correctAnswer = Math.random() < 0.5 ? 'top' : 'bottom';
  // 更新界面状态
  document.getElementById('current-round').textContent = currentRound;
  document.getElementById('score').textContent = `得分：${totalScore}`;
  
  // 重置卡片状态
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('correct', 'wrong');
    card.querySelector('.choice-btn').disabled = false;
  });
  const realPosition = correctAnswer;
  const aiPosition = realPosition === 'top' ? 'bottom' : 'top';

  /**
   * 图片加载规则：
   * - 根据正确答案位置决定图片类型：
   *   - realPosition对应的位置加载real_images目录图片
   *   - 另一位置加载ai_images目录图片
   * - 图片路径格式：/assets/[文件夹]/[1-10].jpg
   * - 使用随机图片索引（1-10）保证关卡多样性
   */
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    const isReal = index === (realPosition === 'top' ? 0 : 1);
    // 选择可用图片
    let realAvailable = realImages.filter(img => !usedReal.has(img));
    let aiAvailable = aiImages.filter(img => !usedAi.has(img));

    // 重置已用集合
    if (realAvailable.length === 0) {
      usedReal.clear();
      realAvailable = realImages;
    }
    if (aiAvailable.length === 0) {
      usedAi.clear();
      aiAvailable = aiImages;
    }

    // 随机选择图片
    const folder = isReal ? 'real_images' : 'ai_images';
    const file = isReal ? 
      realAvailable[Math.floor(Math.random() * realAvailable.length)] :
      aiAvailable[Math.floor(Math.random() * aiAvailable.length)];

    // 记录已用图片
    isReal ? usedReal.add(file) : usedAi.add(file);

    // 设置卡片图片
    card.querySelector('.image-container').style.backgroundImage = 
      `url('assets/${folder}/${file}')`;
    card.dataset.isReal = isReal;
  });
}

// 处理用户选择
function handleChoice(e) {
  const selectedCard = e.target.closest('.card');
  // 验证条件：
  // 1. 选择的卡片位置（top/bottom）必须与正确答案一致
  // 2. 卡片类型必须标记为真人（isReal=true）
  const isCorrect = selectedCard.dataset.choice === correctAnswer && selectedCard.dataset.isReal === 'true';

  // 禁用按钮
  document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
  
  // 显示结果样式
  selectedCard.classList.add(isCorrect ? 'correct' : 'wrong');
  
  // 更新得分
  if (isCorrect) totalScore++;
  document.getElementById('score').textContent = `得分：${totalScore}`;
  
  // 进入下一关
  setTimeout(() => {
    if (currentRound < 5) {
      currentRound++;
      newRound();
    } else {
      showResult();
    }
  }, 1500);
}

// 显示结算界面
function showResult() {
  screens.game.classList.remove('active');
  screens.result.classList.add('active');
  document.getElementById('final-score').textContent = totalScore;
}

// 重新开始游戏
function restartGame() {
  currentRound = 1;
  totalScore = 0;
  screens.result.classList.remove('active');
  screens.game.classList.add('active');
  newRound();
}

function isImageFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
}

async function loadImageList(folder) {
  try {
    const response = await fetch(`assets/${folder}/`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('a'))
      .map(a => a.href.split('/').pop())
      .filter(f => f && !['.DS_Store','filelist.json'].includes(f))
      .filter(f => isImageFile(f));
  } catch (error) {
    console.error('加载图片失败:', error);
    return [];
  }
}

// 启动游戏
initGame();