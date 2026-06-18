window.onload = function() {
    let digitScore = 0, digitActive = false, digitTime = 15, digitCountdown, nums = [];
    let stroopCorrect = 0, stroopActive = false, stroopTime = 30, stroopCountdown, currentColor = '';
    const words = ['แดง', 'เขียว', 'น้ำเงิน', 'เหลือง'], colors = ['#D55E00', '#009E73', '#0072B2', '#F0E442'];

    function updateDataCountDisplay() {
        const storedData = localStorage.getItem('allStudentResults');
        const count = storedData ? JSON.parse(storedData).length : 0;
        document.getElementById('dataCountText').textContent = `ข้อมูลสะสม: ${count} คน`;
    }
    updateDataCountDisplay();

    function generateDistributedGrid() {
        nums = []; for (let i = 0; i < 15; i++) nums.push(2);
        while (nums.length < 100) { let n = Math.floor(Math.random() * 8) + 1; if (n >= 2) n++; nums.push(n); }
        let attempts = 0;
        while (attempts < 100) {
            nums.sort(() => Math.random() - 0.5);
            let hasAdjacentTwos = false;
            for (let i = 0; i < nums.length - 1; i++) {
                if ((nums[i] === 2 && nums[i+1] === 2) || (i + 10 < 100 && nums[i] === 2 && nums[i+10] === 2)) { hasAdjacentTwos = true; break; }
            }
            if (!hasAdjacentTwos) break; attempts++;
        }
        const grid = document.getElementById('grid'); grid.innerHTML = '';
        nums.forEach(n => {
            const c = document.createElement('div'); c.className = 'cell'; c.textContent = n;
            c.onclick = () => {
                if (!digitActive || c.dataset.done) return; c.dataset.done = true;
                if (n === 2) { digitScore++; c.classList.add('correct'); }
                else { digitScore--; if (digitScore < 0) digitScore = 0; c.classList.add('wrong'); }
                document.getElementById('digitResult').textContent = 'คะแนน: ' + digitScore;
            };
            grid.appendChild(c);
        });
    }
    generateDistributedGrid();

    document.getElementById('nextToTestBtn').onclick = function() {
        const fields = ['studentId', 'studentGrade', 'studentGender', 'studentGpa', 'sleepHours', 'screenTime', 'breakfastDays', 'exerciseDays', 'waterGlasses', 'stressLevel'];
        if (fields.some(f => !document.getElementById(f).value)) { alert('⚠️ กรุณากรอกข้อมูลและเลือกตัวเลือกให้ครบทุกช่องก่อนเริ่มแบบทดสอบครับ'); return; }
        document.getElementById('student-info-section').style.display = 'none';
        document.getElementById('main-test-area').style.display = 'block';
        digitActive = true; startDigitTimer();
    };

    function startDigitTimer() {
        digitTime = 15;
        document.getElementById('digitTimer').textContent = digitTime;
        clearInterval(digitCountdown);
        digitCountdown = setInterval(() => {
            digitTime--; document.getElementById('digitTimer').textContent = digitTime;
            if (digitTime <= 0) { clearInterval(digitCountdown); digitActive = false; alert('หมดเวลาส่วนที่ 1 ครับ กรุณาทำส่วนที่ 2 ต่อได้เลย'); }
        }, 1000);
    }

    document.getElementById('startStroopBtn').onclick = function() {
        if(stroopActive) return; stroopActive = true; stroopTime = 30; stroopCorrect = 0;
        nextWord();
        clearInterval(stroopCountdown);
        stroopCountdown = setInterval(()=>{
            stroopTime--; document.getElementById('stroopTimer').textContent = stroopTime;
            if(stroopTime <= 0){ clearInterval(stroopCountdown); stroopActive = false; document.getElementById('stroopWord').textContent = 'หมดเวลา'; }
        },1000);
    };

    function nextWord(){
        if(!stroopActive) return;
        let w = Math.floor(Math.random()*4), c = Math.floor(Math.random()*4);
        while(w === c) c = Math.floor(Math.random()*4);
        currentColor = colors[c];
        document.getElementById('stroopWord').textContent = words[w];
        document.getElementById('stroopWord').style.color = currentColor;
    }

    const colorBtns = {'แดง': '#D55E00', 'เขียว': '#009E73', 'น้ำเงิน': '#0072B2', 'เหลือง': '#F0E442'};
    Object.keys(colorBtns).forEach(t => {
        const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === t);
        if(btn) btn.onclick = () => { if(!stroopActive) return; if(colorBtns[t] === currentColor) stroopCorrect++; else { stroopCorrect--; if(stroopCorrect<0) stroopCorrect=0; } document.getElementById('stroopResult').textContent = 'คะแนน: '+stroopCorrect; nextWord(); };
    });

    document.getElementById('calculateBtn').onclick = function() {
        const dScore = (digitScore / 15) * 100, sScore = Math.min(stroopCorrect * 5, 100);
        const attention = (dScore + sScore) / 2;
        
        let wPts = 0;
        let healthTips = []; // คลังคำแนะนำพฤติกรรมสุขภาพรายบุคคล

        // 1. วิเคราะห์การนอนหลับ
        const sleep = parseFloat(document.getElementById('sleepHours').value) || 0;
        if (sleep >= 7 && sleep <= 9) {
            wPts += 5;
        } else if (sleep > 6) {
            wPts += 3;
            healthTips.push('🛌 <b>เรื่องนอน:</b> ลองขยับเวลานอนให้เร็วขึ้นอีกนิด ให้ได้ 8 ชั่วโมง สมองจะเฟรชกว่านี้ครับ');
        } else {
            wPts += 1;
            healthTips.push('❌ <b>เรื่องนอน (ต่ำกว่าเกณฑ์):</b> ตอนนี้นอนน้อยเกินไปนะ ควรนอนให้ได้อย่างน้อย 7-8 ชั่วโมง เพื่อให้สมองได้พักเต็มที่และโฟกัสได้ดีขึ้นครับ');
        }
        
        // 2. วิเคราะห์เวลาหน้าจอ
        const screen = parseFloat(document.getElementById('screenTime').value) || 0;
        if (screen <= 2) {
            wPts += 5;
        } else if (screen <= 4) {
            wPts += 3;
            healthTips.push('📱 <b>เวลาหน้าจอ:</b> เล่นเพลินไปนิดนึง ลองลดเวลาดูจอช่วงก่อนนอนลง จะช่วยให้หลับลึกขึ้นนะ');
        } else {
            wPts += 1;
            healthTips.push('❌ <b>เวลาหน้าจอ (มากเกินไป):</b> ใช้จอเพื่อความบันเทิงนานเกินไปแล้ว ลองลดให้เหลือไม่เกินวันละ 2 ชั่วโมง สายตาและสมองจะได้ไม่ล้าครับ');
        }
        
        // 3. วิเคราะห์อาหารเช้า
        const bFast = parseInt(document.getElementById('breakfastDays').value) || 0;
        if (bFast == 7) {
            wPts += 5;
        } else if (bFast >= 3) {
            wPts += 3;
            healthTips.push('🍳 <b>อาหารเช้า:</b> กินเพิ่มอีกหน่อยให้ครบทุกวัน สมองจะได้มีพลังงานสม่ำเสมอนะ');
        } else {
            wPts += 1;
            healthTips.push('❌ <b>อาหารเช้า (น้อยเกินไป):</b> แทบไม่ได้กินมื้อเช้าเลย สมองไม่มีน้ำตาลไปใช้ทำให้สมาธิหลุดง่าย ควรพยายามกินอาหารเช้าทุกวันนะครับ');
        }
        
        // 4. วิเคราะห์การออกกำลังกาย
        const exer = parseInt(document.getElementById('exerciseDays').value) || 0;
        if (exer >= 3) {
            wPts += 5;
        } else if (exer >= 1) {
            wPts += 3;
            healthTips.push('🏃‍♂️ <b>ออกกำลังกาย:</b> เพิ่มเป็นสัปดาห์ละ 3 วันดูนะ จะช่วยให้เลือดไหลเวียนไปเลี้ยงสมองได้ดีขึ้น');
        } else {
            wPts += 1;
            healthTips.push('❌ <b>ออกกำลังกาย (น้อยเกินไป):</b> ร่างกายแทบไม่ได้ขยับเลย หาเวลาขยับร่างกายหรือเล่นกีฬาอย่างน้อย 30 นาทีต่อวัน สัปดาห์ละ 3 วัน จะช่วยให้กระปรี้กระเปร่าขึ้นครับ');
        }
        
        // 5. วิเคราะห์การดื่มน้ำ
        const water = parseInt(document.getElementById('waterGlasses').value) || 0;
        if (water >= 6) {
            wPts += 5;
        } else if (water >= 3) {
            wPts += 3;
            healthTips.push('💧 <b>การดื่มน้ำ:</b> จิบเพิ่มระหว่างวันอีกนิด ให้ได้วันละ 6-8 แก้ว ระบบประสาทจะทำงานได้ไวขึ้นครับ');
        } else {
            wPts += 1;
            healthTips.push('❌ <b>การดื่มน้ำ (น้อยเกินไป):</b> ดื่มน้ำน้อยเกินไปแล้ว ถ้าร่างกายขาดน้ำสมองจะประมวลผลช้าลง ควรดื่มน้ำเปล่าให้ได้อย่างน้อยวันละ 6-8 แก้วนะ');
        }
        
        // 6. วิเคราะห์ระดับความเครียด
        const stressVal = parseInt(document.getElementById('stressLevel').value) || 3;
        wPts += stressVal;
        if (stressVal <= 2) {
            healthTips.push('🧠 <b>ความเครียด:</b> ตอนนี้เครียดหรือล้าสมองมากเกินไปแล้ว หาเวลาพักสายตา ฟังเพลง หรือเดินยืดเส้นยืดสายบ้างนะครับ');
        }

        const wellness = (wPts / 30) * 100;

        // แปลผลคะแนน Attention Score
        let attentionLabel = '';
        let mainAdvice = '';
        if (attention >= 80) {
            attentionLabel = '<span style="color:#0d9488; font-weight:bold;">ดีมาก เก่งมากครับ!</span>';
            mainAdvice = '🎉 สมองประมวลผลได้ว่องไวและแม่นยำสุด ๆ แสดงว่ามีความตั้งใจและจดจ่อสูงมาก';
        } else if (attention >= 60) {
            attentionLabel = '<span style="color:#3b82f6; font-weight:bold;">ปกติ ตามมาตรฐานครับ</span>';
            mainAdvice = '👍 การจดจ่ออยู่ในเกณฑ์ปกติทั่วไป สามารถพัฒนาเพิ่มความเร็วและความแม่นยำขึ้นได้อีกนะ';
        } else {
            attentionLabel = '<span style="color:#ef4444; font-weight:bold;">ต่ำกว่าเกณฑ์ ควรปรับปรุงนะ</span>';
            mainAdvice = '🎯 ตอนนี้คะแนนสมาธิค่อนข้างน้อย สมาธิอาจจะกำลังหลุดลอยหรือสมองล้าอยู่ครับ';
        }

        // มัดรวมคำแนะนำสุขภาพ (ถ้าทำดีทุกข้อจะชมเชย)
        let finalHealthAdvice = '';
        if (healthTips.length === 0) {
            finalHealthAdvice = '🌟 <b>สุดยอดพฤติกรรมสุขภาพ!</b> รักษาวินัยการดูแลตัวเองแบบนี้ต่อไปเรื่อย ๆ เลยนะ ดีต่อร่างกายและสมองมากครับ';
        } else {
            finalHealthAdvice = healthTips.join('<br><br>');
        }

        const results = {
            id: document.getElementById('studentId').value || 'ไม่ได้ระบุ', 
            grade: document.getElementById('studentGrade').value || 'ไม่ได้ระบุ',
            gender: document.getElementById('studentGender').value || 'ไม่ได้ระบุ',
            gpa: document.getElementById('studentGpa').value || 'ไม่ได้ระบุ', 
            sleep: sleep, screen: screen, bFast: bFast, exer: exer, water: water,
            stress: stressVal, attention: attention.toFixed(1), wellness: wellness.toFixed(1)
        };

        let data = JSON.parse(localStorage.getItem('allStudentResults') || '[]');
        data.push(results); localStorage.setItem('allStudentResults', JSON.stringify(data));
        updateDataCountDisplay();

        document.getElementById('final').innerHTML = `
            <div style="background:#e0f2f1; padding:20px; border-radius:10px; text-align:left; border: 1px solid #b2dfdb; font-family:'Prompt', sans-serif;">
                <p style="color:#00796b; font-weight:bold; margin-top:0; font-size:18px;">✅ ประมวลผลและบันทึกคะแนนเรียบร้อยแล้ว</p>
                
                <p style="margin-bottom:5px;"><b>Attention Score (ดัชนีสมาธิ):</b> ${attention.toFixed(1)}% -> แปลผล: ${attentionLabel}</p>
                <div style="background:#ddd; height:12px; border-radius:6px; margin-bottom:15px; overflow:hidden;"><div style="background:#0d9488; width:${attention}%; height:100%;"></div></div>
                
                <p style="margin-bottom:5px;"><b>Wellness Score (ดัชนีสุขภาวะ):</b> ${wellness.toFixed(1)}%</p>
                <div style="background:#ddd; height:12px; border-radius:6px; margin-bottom:15px; overflow:hidden;"><div style="background:#3b82f6; width:${wellness}%; height:100%;"></div></div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 15px; font-size: 15px; line-height: 1.6; color: #334155;">
                    <p style="margin-top:0; margin-bottom:10px; font-weight:bold; color:#0f766e; font-size:16px;">💡 ผลวิเคราะห์และคำแนะนำสำหรับคุณ:</p>
                    <p style="margin-bottom:15px; background:#f0fdf4; padding:8px; border-radius:6px;">${mainAdvice}</p>
                    <p style="font-weight:bold; margin-bottom:5px; color:#1e293b;">🛠️ สิ่งที่สามารถปรับเปลี่ยนได้เพื่ออัปสมาธิ:</p>
                    <div style="padding-left:5px;">${finalHealthAdvice}</div>
                </div>

                <button onclick="location.reload()" style="margin-top:20px; background:#64748b; color:white; padding:10px 20px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; font-size:15px;">🔄 รับนักเรียนคนถัดไป</button>
            </div>`;
    };

    document.getElementById('downloadAllCsvBtn').onclick = function() {
        const data = JSON.parse(localStorage.getItem('allStudentResults') || '[]');
        if(!data.length) return alert('ปัจจุบันยังไม่มีข้อมูลสะสมในระบบครับ');
        const headers = ['StudentID', 'Grade', 'Gender', 'GPAX', 'SleepHours', 'ScreenTime', 'BreakfastDays', 'ExerciseDays', 'WaterGlasses', 'StressLevel', 'AttentionScore', 'WellnessScore'];
        const csv = "\uFEFF" + [headers.join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
        link.download = "FocusMind_DAT_Class_Report.csv"; link.click();
    };
};
