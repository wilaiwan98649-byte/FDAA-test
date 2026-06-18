window.onload = function() {
    // ---------------- Digit Test ----------------
    let digitScore = 0;
    let digitActive = true;
    const nums = [];

    // กำหนดจำนวนเลข 2 ให้มี 15 ตัวตามกติกา
    for (let i = 0; i < 15; i++) nums.push(2);

    while (nums.length < 100) {
        let n = Math.floor(Math.random() * 8) + 1;
        if (n >= 2) n++;
        nums.push(n);
    }

    nums.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('grid');
    
    // ตั้งค่าเวลาเริ่มต้นของส่วนที่ 1 เป็น 15 วินาทีอย่างถูกต้อง
    let digitTime = 15; 
    const timerElement = document.getElementById('digitTimer');
    if (timerElement) {
        timerElement.textContent = digitTime;
    }

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
                // แตะผิดแต้มติดลบ แต่คะแนนสะสมจะไม่ต่ำกว่า 0
                digitScore--;
                if (digitScore < 0) digitScore = 0;
                c.classList.add('wrong');
            }
            document.getElementById('digitResult').textContent = 'คะแนน: ' + digitScore;
        };
        if (grid) grid.appendChild(c);
    });

    // เริ่มระบบนับถอยหลัง 15 วินาทีอย่างถูกต้องเมื่อเปิดหน้าเว็บ
    const digitCountdown = setInterval(() => {
        digitTime--;
        if (timerElement) {
            timerElement.textContent = digitTime;
        }
        if (digitTime <= 0) {
            clearInterval(digitCountdown);
            digitActive = false;
        }
    }, 1000);

    // ---------------- Stroop Test ----------------
    const words = ['แดง', 'เขียว', 'น้ำเงิน', 'เหลือง'];
    const colors = ['red', 'green', 'blue', '#FFFF00']; // ใช้สีเหลืองโทนสว่างชัดเจน
    let currentColor = '';
    let stroopCorrect = 0;
    let stroopActive = false;
    let stroopTime = 30; 
    let stroopCountdown;

    const startBtn = document.getElementById('startStroopBtn');
    if (startBtn) {
        startBtn.onclick = startStroop;
    }

    // เชื่อมปุ่มสีแบบจับคู่ข้อความในหน้าเว็บ
    const colorButtons = {
        'แดง': 'red', 'เขียว': 'green', 'น้ำเงิน': 'blue', 'เหลือง': '#FFFF00'
    };
    Object.keys(colorButtons).forEach(btnText => {
        const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === btnText);
        if (btn) {
            btn.onclick = () => answer(colorButtons[btnText]);
        }
    });

    // เชื่อมปุ่มคำนวณคะแนนรวม
    const calcBtn = document.getElementById('calculateBtn');
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
        
        // บล็อกป้องกันไม่ให้คำและสีตรงกันอย่างเด็ดขาด
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

    // ระบบตรวจเช็กคำตอบของ Stroop
    function answer(color){
        if(!stroopActive) return;
        if(color === currentColor){
            stroopCorrect++;
        }
        document.getElementById('stroopResult').textContent = 'คะแนน: ' + stroopCorrect;
        nextWord();
    }

    // ---------------- Attention Score & ผลสรุป ----------------
    function calculate(){
        const digitAcc = (digitScore / 15) * 100;
        const stroopAcc = Math.min(stroopCorrect * 5, 100);
        const attention = (digitAcc + stroopAcc) / 2;
        let level = 'ควรปรับปรุง (Needs Improvement)';
        if(attention >= 80) level = 'ดีมาก (Excellent)';
        else if(attention >= 60) level = 'ปกติ (Normal)';

        // ดึงข้อมูลพื้นฐานที่นักเรียนกรอกเข้ามา
        const id = document.getElementById('studentId').value || 'ไม่ได้ระบุ';
        const grade = document.getElementById('studentGrade').value || 'ไม่ได้ระบุ';
        const gpa = document.getElementById('studentGpa').value || 'ไม่ได้ระบุ';
        const sleep = document.getElementById('sleepHours').value || 'ไม่ได้ระบุ';
        const screen = document.getElementById('screenTime').value || 'ไม่ได้ระบุ';
        const breakfast = document.getElementById('breakfastStatus').value || 'ไม่ได้ระบุ';

        // วาดส่วนแสดงผลคะแนนและข้อมูลลงบนหน้าเว็บ
        document.getElementById('final').innerHTML = `
            <div style="text-align: left; background: #e0f2f1; padding: 15px; border-radius: 8px; margin-top: 15px; font-weight: normal; font-size: 16px;">
                <p><b>ข้อมูลผู้ทดสอบ:</b> รหัส: ${id} | ชั้น: ${grade} | GPAX: ${gpa}</p>
                <p><b>พฤติกรรมสุขภาพ:</b> นอนเมื่อคืน: ${sleep} ชม. | เวลาหน้าจอ: ${screen} ชม./วัน | มื้อเช้า: ${breakfast}</p>
                <hr style="border: 0; border-top: 1px solid #b2dfdb;">
                <p style="font-size: 22px; font-weight: bold; color: #00796b; margin: 5px 0 0 0;">
                    Attention Score = ${attention.toFixed(1)} (${level})
                </p>
            </div>
        `;
    }
};
