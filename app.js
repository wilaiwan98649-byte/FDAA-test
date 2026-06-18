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
        const fields = ['studentId', 'studentGrade', 'studentGpa', 'sleepHours', 'screenTime', 'breakfastDays', 'exerciseDays', 'waterGlasses', 'stressLevel'];
        if (fields.some(f => !document.getElementById(f).value)) { alert('กรุณากรอกข้อมูลให้ครบทุกช่องก่อนเริ่มครับ'); return; }
        document.getElementById('student-info-section').style.display = 'none';
        document.getElementById('main-test-area').style.display = 'block';
        digitActive = true; startDigitTimer();
    };

    function startDigitTimer() {
        digitCountdown = setInterval(() => {
            digitTime--; document.getElementById('digitTimer').textContent = digitTime;
            if (digitTime <= 0) { clearInterval(digitCountdown); digitActive = false; alert('หมดเวลาส่วนที่ 1 ครับ'); }
        }, 1000);
    }

    document.getElementById('startStroopBtn').onclick = function() {
        if(stroopActive) return; stroopActive = true; stroopTime = 30; stroopCorrect = 0;
        nextWord();
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
        
        // Wellness Score Calculation (Max 30 pts)
        let wPts = 0;
        const sleep = parseFloat(document.getElementById('sleepHours').value);
        if(sleep >= 7 && sleep <= 9) wPts += 5; else if(sleep > 6) wPts += 3; else wPts += 1;
        
        const screen = parseFloat(document.getElementById('screenTime').value);
        if(screen <= 2) wPts += 5; else if(screen <= 4) wPts += 3; else wPts += 1;
        
        const bFast = parseInt(document.getElementById('breakfastDays').value);
        if(bFast == 7) wPts += 5; else if(bFast >= 3) wPts += 3; else wPts += 1;
        
        const exer = parseInt(document.getElementById('exerciseDays').value);
        if(exer >= 3) wPts += 5; else if(exer >= 1) wPts += 3; else wPts += 1;
        
        const water = parseInt(document.getElementById('waterGlasses').value);
        if(water >= 6) wPts += 5; else if(water >= 3) wPts += 3; else wPts += 1;
        
        wPts += parseInt(document.getElementById('stressLevel').value);
        const wellness = (wPts / 30) * 100;

        const results = {
            id: document.getElementById('studentId').value, grade: document.getElementById('studentGrade').value,
            gpa: document.getElementById('studentGpa').value, sleep: sleep, screen: screen, bFast: bFast, exer: exer, water: water,
            stress: document.getElementById('stressLevel').value, attention: attention.toFixed(1), wellness: wellness.toFixed(1)
        };

        let data = JSON.parse(localStorage.getItem('allStudentResults') || '[]');
        data.push(results); localStorage.setItem('allStudentResults', JSON.stringify(data));
        updateDataCountDisplay();

        document.getElementById('final').innerHTML = `
            <div style="background:#e0f2f1; padding:20px; border-radius:10px; text-align:left;">
                <p><b>Attention Score:</b> ${attention.toFixed(1)}%</p>
                <div style="background:#ddd; height:10px; border-radius:5px;"><div style="background:#0d9488; width:${attention}%; height:100%; border-radius:5px;"></div></div>
                <p><b>Wellness Score:</b> ${wellness.toFixed(1)}%</p>
                <div style="background:#ddd; height:10px; border-radius:5px;"><div style="background:#3b82f6; width:${wellness}%; height:100%; border-radius:5px;"></div></div>
                <button onclick="location.reload()" style="margin-top:20px; background:#64748b; color:white; padding:10px; border:none; border-radius:5px; cursor:pointer;">รับนักเรียนคนถัดไป</button>
            </div>`;
    };

    document.getElementById('downloadAllCsvBtn').onclick = function() {
        const data = JSON.parse(localStorage.getItem('allStudentResults') || '[]');
        if(!data.length) return alert('ไม่มีข้อมูลสะสมครับ');
        const headers = ['ID', 'Grade', 'GPAX', 'Sleep', 'ScreenTime', 'BreakfastDays', 'ExerciseDays', 'Water', 'StressLevel', 'AttentionScore', 'WellnessScore'];
        const csv = "\uFEFF" + [headers.join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
        link.download = "FocusMind_DAT_Wellness_Report.csv"; link.click();
    };
};

