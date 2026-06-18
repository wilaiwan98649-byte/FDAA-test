window.onload = function() {
    let digitScore = 0;
    let digitActive = false; 
    let digitTime = 15;
    let digitCountdown;
    let nums = [];

    // ฟังก์ชันคอยอัปเดตตัวเลขจำนวนนักเรียนที่ถูกสะสมไว้ในเครื่องปัจจุบัน
    function updateDataCountDisplay() {
        const storedData = localStorage.getItem('allStudentResults');
        const count = storedData ? JSON.parse(storedData).length : 0;
        const countText = document.getElementById('dataCountText');
        if (countText) {
            countText.textContent = `จำนวนข้อมูลที่บันทึกสะสมอยู่ตอนนี้: ${count} คน`;
        }
    }
    updateDataCountDisplay();

    function generateDistributedGrid() {
        nums = [];
        for (let i = 0; i < 15; i++) nums.push(2);
        while (nums.length < 100) {
            let n = Math.floor(Math.random() * 8) + 1;
            if (n >= 2) n++;
            nums.push(n);
        }

        let attempts = 0;
        while (attempts < 100) {
            nums.sort(() => Math.random() - 0.5);
            let hasAdjacentTwos = false;
            for (let i = 0; i < nums.length - 1; i++) {
                if ((nums[i] === 2 && nums[i+1] === 2) || (i + 10 < 100 && nums[i] === 2 && nums[i+10] === 2)) {
                    hasAdjacentTwos = true;
                    break;
                }
            }
            if (!hasAdjacentTwos) break;
            attempts++;
        }

        const grid = document.getElementById('grid');
        if (grid) {
            grid.innerHTML = '';
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
                grid.appendChild(c);
            });
        }
    }

    generateDistributedGrid();

    const nextBtn = document.getElementById('nextToTestBtn');
    if (nextBtn) {
        nextBtn.onclick = function() {
            const id = document.getElementById('studentId').value.trim();
            const grade = document.getElementById('studentGrade').value.trim();
            const gpa = document.getElementById('studentGpa').value.trim();
            const sleep = document.getElementById('sleepHours').value.trim();
            const screen = document.getElementById('screenTime').value.trim();
            const breakfast = document.getElementById('breakfastStatus').value;

            if (!id || !grade || !gpa || !sleep || !screen || !breakfast) {
                alert('⚠️ กรุณากรอกข้อมูลทั่วไปและพฤติกรรมสุขภาพให้ครบทุกช่องก่อนเริ่มทำแบบทดสอบครับ');
                return;
            }

            document.getElementById('student-info-section').style.display = 'none';
            document.getElementById('main-test-area').style.display = 'block';
            digitActive = true;
            startDigitTimer();
        };
    }

    const timerElement = document.getElementById('digitTimer');
    if (timerElement) {
        timerElement.textContent = digitTime;
    }

    function startDigitTimer() {
        digitCountdown = setInterval(() => {
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

        const id = document.getElementById('studentId').value;
        const grade = document.getElementById('studentGrade').value;
        const gpa = document.getElementById('studentGpa').value;
        const sleep = document.getElementById('sleepHours').value;
        const screen = document.getElementById('screenTime').value;
        const breakfast = document.getElementById('breakfastStatus').value;

        // --- ระบบ AUTO SAVE บันทึกอัตโนมัติกันลืม ---
        const currentResult = {
            studentId: id,
            grade: grade,
            gpa: gpa,
            sleep: sleep,
            screen: screen,
            breakfast: breakfast,
            digitScore: digitScore,
            stroopScore: stroopCorrect,
            attentionScore: attention.toFixed(1),
            level: level
        };

        // ดึงอาเรย์เก่าจากเครื่องมาเติมตัวใหม่ต่อท้ายเข้าไป
        let localData = localStorage.getItem('allStudentResults');
        let dataArray = localData ? JSON.parse(localData) : [];
        
        // ตรวจสอบเพื่อป้องกันการบันทึกข้อมูลซ้ำของรหัสนักเรียนเดิมในรอบเดียวกัน
        const isDuplicate = dataArray.some(item => item.studentId === id && item.digitScore === digitScore && item.stroopScore === stroopCorrect);
        if(!isDuplicate) {
            dataArray.push(currentResult);
            localStorage.setItem('allStudentResults', JSON.stringify(dataArray));
            updateDataCountDisplay();
        }

        // วาดหน้าผลสรุปการประเมิน
        document.getElementById('final').innerHTML = `
            <div style="text-align: left; background: #e0f2f1; padding: 15px; border-radius: 8px; margin-top: 15px; font-weight: normal; font-size: 16px;">
                <p style="color: #00796b; font-weight: bold; margin-top: 0;">✅ บันทึกข้อมูลนักเรียนเข้าระบบรวมอัตโนมัติเรียบร้อยแล้ว</p>
                <p><b>ข้อมูลผู้ทดสอบ:</b> รหัส: ${id} | ชั้น: ${grade} | GPAX: ${gpa}</p>
                <p><b>พฤติกรรมสุขภาพ:</b> นอนเมื่อคืน: ${sleep} ชม. | เวลาหน้าจอ: ${screen} ชม./วัน | มื้อเช้า: ${breakfast}</p>
                <hr style="border: 0; border-top: 1px solid #b2dfdb;">
                <p style="font-size: 22px; font-weight: bold; color: #00796b; margin: 5px 10px 10px 0; display: inline-block;">
                    Attention Score = ${attention.toFixed(1)} (${level})
                </p>
                <button id="resetTestBtn" style="background: #64748b; color: white; padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; float: right; margin-top: 5px;">🔄 สลับหน้าจอให้คนถัดไปทำต่อ</button>
                <div style="clear: both;"></div>
            </div>
        `;

        // ปุ่มคำสั่งย้อนกลับไปเริ่มทำใหม่สำหรับนักเรียนคนถัดไป
        document.getElementById('resetTestBtn').onclick = function() {
            document.getElementById('studentId').value = '';
            document.getElementById('studentGrade').value = '';
            document.getElementById('studentGpa').value = '';
            document.getElementById('sleepHours').value = '';
            document.getElementById('screenTime').value = '';
            document.getElementById('breakfastStatus').value = '';

            digitScore = 0;
            digitTime = 15;
            digitActive = false;
            clearInterval(digitCountdown);
            document.getElementById('digitResult').textContent = 'คะแนน: 0';
            document.getElementById('digitTimer').textContent = '15';

            stroopCorrect = 0;
            stroopTime = 30;
            stroopActive = false;
            clearInterval(stroopCountdown);
            document.getElementById('stroopResult').textContent = 'คะแนน: 0';
            document.getElementById('stroopTimer').textContent = '30';
            document.getElementById('stroopWord').textContent = 'คำถามจะขึ้นตรงนี้';
            document.getElementById('stroopWord').style.color = '#1e293b';

            document.getElementById('final').textContent = 'ยังไม่ได้ประมวลผล';
            document.getElementById('main-test-area').style.display = 'none';
            document.getElementById('student-info-section').style.display = 'block';

            generateDistributedGrid();
            window.scrollTo(0,0); // เลื่อนหน้าจอกลับไปด้านบนสุด
        };
    }

    // --- ฟังก์ชันดาวน์โหลดข้อมูลรวมทั้งหมดเป็นไฟล์ CSV ไฟล์เดียว (สำหรับคุณครูใช้ตอนท้ายคาบ) ---
    const downloadAllBtn = document.getElementById('downloadAllCsvBtn');
    if(downloadAllBtn) {
        downloadAllBtn.onclick = function() {
            const localData = localStorage.getItem('allStudentResults');
            const dataArray = localData ? JSON.parse(localData) : [];

            if(dataArray.length === 0) {
                alert('❌ ยังไม่มีข้อมูลนักเรียนในระบบสะสมในขณะนี้ครับ');
                return;
            }

            const headers = ['StudentID', 'Grade', 'GPAX', 'SleepHours', 'ScreenTime', 'Breakfast', 'Digit_Score', 'Stroop_Score', 'Attention_Score', 'Evaluation_Level'];
            const csvRows = [headers.join(',')];

            dataArray.forEach(item => {
                const row = [
                    item.studentId,
                    item.grade,
                    item.gpa,
                    item.sleep,
                    item.screen,
                    item.breakfast,
                    item.digitScore,
                    item.stroopScore,
                    item.attentionScore,
                    `"${item.level}"` // ใส่ฟันหนูครอบเพื่อความปลอดภัยกรณีมีเว้นวรรค
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = "\uFEFF" + csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `FocusMind_DAT_All_Results.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
};
