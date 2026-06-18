
// ---------------- Digit Test ----------------
let digitScore = 0;
let digitActive = true;

const nums = [];
for(let i=0;i<10;i++) nums.push(2);

while(nums.length < 100){
  let n = Math.floor(Math.random()*8)+1;
  if(n >= 2) n++;
  nums.push(n);
}

nums.sort(()=>Math.random()-0.5);

const grid = document.getElementById('grid');

nums.forEach(n=>{
  const c = document.createElement('div');
  c.className='cell';
  c.textContent=n;

  c.onclick = ()=>{
    if(!digitActive || c.dataset.done) return;

    c.dataset.done = true;

    if(n===2){
      digitScore++;
      c.classList.add('correct');
    }else{
      c.classList.add('wrong');
    }

    document.getElementById('digitResult').textContent =
      'คะแนน: ' + digitScore;
  };

  grid.appendChild(c);
});

let digitTime = 30;

const digitCountdown = setInterval(()=>{
  digitTime--;
  document.getElementById('digitTimer').textContent = digitTime;

  if(digitTime <= 0){
    clearInterval(digitCountdown);
    digitActive = false;
  }
},1000);


// ---------------- Stroop Test ----------------
const words = ['แดง','เขียว','น้ำเงิน','เหลือง'];
const colors = ['red','green','blue','orange'];

let currentColor = '';
let stroopCorrect = 0;
let stroopActive = false;
let stroopTime = 30;
let stroopCountdown;

function startStroop(){

  if(stroopActive) return;

  stroopActive = true;
  nextWord();

  stroopCountdown = setInterval(()=>{
      stroopTime--;
      document.getElementById('stroopTimer').textContent = stroopTime;

      if(stroopTime <= 0){
          clearInterval(stroopCountdown);
          stroopActive = false;
          document.getElementById('stroopWord').textContent = 'หมดเวลา';
      }
  },1000);
}

function nextWord(){

  if(!stroopActive) return;

  const word =
      words[Math.floor(Math.random()*4)];

  currentColor =
      colors[Math.floor(Math.random()*4)];

  const el =
      document.getElementById('stroopWord');

  el.textContent = word;
  el.style.color = currentColor;
}

function answer(color){

  if(!stroopActive) return;

  if(color === currentColor){
      stroopCorrect++;
  }

  document.getElementById('stroopResult').textContent =
      'คะแนน: ' + stroopCorrect;

  nextWord();
}


// ---------------- Attention Index ----------------
function calculate(){

  const digitAcc = (digitScore / 10) * 100;

  const stroopAcc = Math.min(stroopCorrect * 5,100);

  const attention =
      (digitAcc + stroopAcc)/2;

  let level = 'ต่ำ';
  if(attention >= 80) level = 'สูง';
  else if(attention >= 60) level = 'ปานกลาง';

  document.getElementById('final').innerHTML =
      'Attention Index = ' +
      attention.toFixed(1) +
      ' (' + level + ')';
}
