window.onload = function() {
    // ---------------- Digit Test ----------------
    let digitScore = 0;
    let digitActive = true;
    const nums = [];

    // 1. เพิ่มเลข 2 เป็น 15 ตัวตามที่ต้องการ
    for (let i = 0; i < 15; i++) nums.push(2);

    while (nums.length < 100) {
        let n = Math.floor(Math.random() * 8) + 1;
        if (n >= 2) n++;
        nums.push(n);
    }

    nums.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('grid');

    nums.forEach(n => {
        const c = document.createElement('div');
        c.className = 'cell';
        c.textContent = n;
        c.onclick = () => {
            if (!digitActive || c.dataset.done) return;
            c.dataset.done = true;
            if (n === 2) {
                digitScore++;
                c.classList.add('correct');
            } else {
                // 2. แตะผิดแล้วติดลบ แต่คะแนนรวมจะไม่ต่ำกว่า 0
                digitScore--;
                if (digitScore < 0) digitScore = 0;
                c.classList.add('wrong');
            }
            document.getElementById('digitResult').textContent = 'คะแนน: ' + digitScore;
        };
        grid.appendChild(c);
    });

    // 3. จำกัดเวลาเป็น 15 วินาที
    let digitTime = 15; 
    const digitCountdown = setInterval(() => {
        digitTime--;
        document.getElementById('digitTimer').textContent = digitTime;
        if (digitTime <= 0) {
            clearInterval(digitCountdown);
            digitActive = false;
        }
    }, 1000);

    // ---------------- Stroop Test ----------------
    const words = ['แดง', 'เขียว', 'น้ำเงิน', 'เหลือง'];
    // 4. เปลี่ยนโทนสีเหลืองเป็น Pure Yellow (#FFFF00) แทนส้ม
    const colors = ['red', 'green', 'blue', '#FFFF00']; 
    let currentColor = '';
    let stroopCorrect = 0;
    let stroopActive = false;
    let stroopTime = 30; 
    let stroopCountdown;

    const startBtn = document.querySelector('button[onclick="startStroop()"]') || document.getElementById('startStroopBtn');
    if (startBtn) {
        startBtn.onclick = startStroop;
    }

    const colorButtons = {
        'แดง': 'red', 'เขียว': 'green', 'น้ำเงิน': 'blue', 'เหลือง': '#FFFF00'
    };
    Object.keys(colorButtons).forEach(btnText => {
        const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === btnText);
        if (btn) {
            btn.onclick = () => answer(colorButtons[btnText]);
        }
    });

    const calcBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('คำนวณ'));
    if (calcBtn) {
        calcBtn.onclick = calculate;
    }

    function startStroop(){
        if(stroopActive) return;
        stroopActive = true;
        stroopTime = 30;
        stroopCorrect = 0;
        document.getElementById('stroopResult').textContent = 'คะแนน: 0';
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
        
        let wordIndex = Math.floor(Math.random() * 4);
        let colorIndex = Math.floor(Math.random() * 4);
        
        // 5. ป้องกันไม่ให้คำกับสีตรงกัน (Word กับ Color ต้องไม่ซ้ำกัน)
        while (wordIndex === colorIndex) {
            colorIndex = Math.floor(Math.random() * 4);
        }
        
        const word = words[wordIndex];
        currentColor = colors[colorIndex];
        
        const el = document.getElementById('stroopWord');
        if (el) {
            el.textContent = word;
            el.style.color = currentColor;
        }
    }

    function answer(color){
        if(!stroopActive) return;
        if(color === currentColor){
            stroopCorrect++;
        }
        document.getElementById('stroopResult').textContent = 'คะแนน: ' + stroopCorrect;
        nextWord();
    }

    // ---------------- Attention Index ----------------
    function calculate(){
        // ปรับการคิดคะแนนฐานเต็มของ Digit Test เป็น 15 คะแนน
        const digitAcc = (digitScore / 15) * 100;
        const stroopAcc = Math.min(stroopCorrect * 5, 100);
        const attention = (digitAcc + stroopAcc) / 2;
        let level = 'ต่ำ';
        if(attention >= 80) level = 'สูง';
        else if(attention >= 60) level = 'ปานกลาง';
        document.getElementById('final').innerHTML = 'Attention Index = ' + attention.toFixed(1) + ' (' + level + ')';
    }
};
