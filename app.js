window.onload = function() {
    // ตั้งค่าตัวแปรสำหรับแบบทดสอบส่วนที่ 1
    let digitScore = 0;
    let digitActive = false; 
    let digitTime = 15;
    const nums = [];

    const nextBtn = document.getElementById('nextToTestBtn');
    if (nextBtn) {
        nextBtn.onclick = function() {
            document.getElementById('student-info-section').style.display = 'none';
            document.getElementById('main-test-area').style.display = 'block';
            digitActive = true;
            startDigitTimer();
        };
    }

    for (let i = 0; i < 15; i++) nums.push(2);

    while (nums.length < 100) {
        let n = Math.floor(Math.random() * 8) + 1;
        if (n >= 2) n++;
        nums.push(n);
    }

    nums.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('grid');
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
                digitScore--;
                if (digitScore < 0) digitScore = 0;
                c.classList.add('wrong');
            }
            document.getElementById('digitResult').textContent = 'คะแนน: ' + digitScore;
        };
        if (grid) grid.appendChild(c);
    });

    function startDigitTimer() {
        const digitCountdown = setInterval(() => {
            digitTime--;
            if (timerElement) {
                timerElement.textContent = digitTime;
            }
            if (digitTime <= 0) {
                clearInterval(digitCountdown);
                digitActive = false;
                alert('หมดเวลาสำหรับส่วนที่ 1 แล้วครับ กรุณาทำส่วนที่ 2 ต่อได้เลย');
            }
        }, 1000);
    }

    // ---------------- Stroop Test ----------------
    const words = ['แดง', 'เขียว', 'น้ำเงิน', 'เหลือง'];
    const colors = ['#D55E00', '#009E73', '#0072B2', '#F0E442']; 
    let currentColor = '';
    let stroopCorrect = 0;
    let stroopActive = false;
    let stroopTime = 30; 
    let stroopCountdown;

    const startBtn = document.getElementById('startStroopBtn');
    if (startBtn) {
        startBtn.onclick = startStroop;
    }

    const colorButtons = {
        'แดง': '#D55E00', 'เขียว': '#009E73', 'น้ำเงิน': '#0072B2', 'เหลือง': '#F0E442'
    };
    Object.keys(colorButtons).forEach(btnText => {
        const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === btnText);
        if (btn) {
            btn.onclick = () => answer(colorButtons[btnText]);
        }
    });

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
        } else {
            stroopCorrect--;
            if (stroopCorrect < 0) stroopCorrect = 0;
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

        const id = document.getElementById('studentId') ? document.getElementById('studentId').value : 'ไม่ได้ระบุ';
        const grade = document.getElementById('studentGrade') ? document.getElementById('studentGrade').value : 'ไม่ได้ระบุ';
        const gpa = document.getElementById('studentGpa') ? document.getElementById('studentGpa').value : 'ไม่ได้ระบุ';
        const sleep = document.getElementById('sleepHours') ? document.getElementById('sleepHours').value : 'ไม่ได้ระบุ';
        const screen = document.getElementById('screenTime') ? document.getElementById('screenTime').value : 'ไม่ได้ระบุ';
        const breakfast = document.getElementById('breakfastStatus') ? document.getElementById('breakfastStatus').value : 'ไม่ได้ระบุ';

        // วาดส่วนแสดงผลคะแนนและเพิ่มปุ่มดาวน์โหลดไฟล์ CSV ล่างสุด
        document.getElementById('final').innerHTML = `
            <div style="text-align: left; background: #e0f2f1; padding: 15px; border-radius: 8px; margin-top: 15px; font-weight: normal; font-size: 16px;">
                <p><b>ข้อมูลผู้ทดสอบ:</b> รหัส: ${id} | ชั้น: ${grade} | GPAX: ${gpa}</p>
                <p><b>พฤติกรรมสุขภาพ:</b> นอนเมื่อคืน: ${sleep} ชม. | เวลาหน้าจอ: ${screen} ชม./วัน | มื้อเช้า: ${breakfast}</p>
                <hr style="border: 0; border-top: 1px solid #b2dfdb;">
                <p style="font-size: 22px; font-weight: bold; color: #00796b; margin: 5px 10px 10px 0; display: inline-block;">
                    Attention Score = ${attention.toFixed(1)} (${level})
                </p>
                <button id="downloadCsvBtn" style="background: #00796b; color: white; padding: 6px 15px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; float: right; margin-top: 5px;">📥 ดาวน์โหลดข้อมูล (.CSV)</button>
                <div style="clear: both;"></div>
            </div>
        `;

        // ผูกฟังก์ชันสร้างและดาวน์โหลดไฟล์ CSV เมื่อกดปุ่มดาวน์โหลด
        document.getElementById('downloadCsvBtn').onclick = function() {
            // หัวคอลัมน์ของตารางข้อมูล (Header)
            const headers = ['StudentID', 'Grade', 'GPAX', 'SleepHours', 'ScreenTime', 'Breakfast', 'Digit_Score', 'Stroop_Score', 'Attention_Score', 'Evaluation_Level'];
            
            // ข้อมูลแถวของนักเรียนคนนี้
            const rowData = [id, grade, gpa, sleep, screen, breakfast, digitScore, stroopCorrect, attention.toFixed(1), level];
            
            // รวม Header และ Data เข้าด้วยกัน และคั่นด้วยเครื่องหมายจุลภาค (Comma)
            const csvContent = "\uFEFF" + [headers.join(','), rowData.join(',')].join('\n');
            
            // สร้างลิงก์เสมือนเพื่อทำการดาวน์โหลดไฟล์ลงในเครื่องคอมพิวเตอร์
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `FocusMind_DAT_Result_${id}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
};
