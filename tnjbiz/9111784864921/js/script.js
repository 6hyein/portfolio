AOS.init({
    once:false,          // 반복 실행
    startEvent: 'load',   // 시작 타이밍
});
// 팝업 창
const openPop = document.getElementById("show-Box");
const policyBox = document.getElementById("policyBox");
const closePolicy = document.getElementById("closePolicy");

openPop.addEventListener('click', (e) => {
  e.preventDefault();
  policyBox.style.display = "flex";
});

closePolicy.addEventListener('click', () => {
  policyBox.style.display = "none";
});

policyBox.addEventListener('click', (e) => {
  if (e.target === policyBox) {
    policyBox.style.display = "none";
  }
});
const loanEl = document.getElementById("loan");
const badEl = document.getElementById("badInterest");
const goodEl = document.getElementById("goodInterest");
const savingEl = document.getElementById("saving");
const resultEl = document.getElementById("result");
let isFirstRender = true;

function calc() {
    const loanMan = parseInt(loanEl.value); // 만원 단위
    const loan = loanMan * 10000;
    const badRaw = loan * 0.12 / 12;
    const goodRaw = loan * 0.03 / 12;
    const bad = Math.floor(badRaw / 10000);
    const good = Math.floor(goodRaw / 10000);
    const saving = bad - good;
    
    function animate(el) {
        el.style.transform = "scale(1.05)";
        setTimeout(() => {
            el.style.transform = "scale(1)";
        }, 200);
    }
    
    badEl.innerText = bad + "만원";
    goodEl.innerText = good + "만원";
    savingEl.innerText = saving + "만원";
    
    animate(goodEl);
    animate(savingEl);
    animate(resultEl);
    
    resultEl.innerText = formatMoney(loanMan);
    updateMiniGraph(bad, good);
}

function formatMoney(num) {
    if (num >= 10000) {
        const eok = Math.floor(num / 10000);
        const man = num % 10000;
        return eok.toLocaleString() + "억 " + (man ? man.toLocaleString() + "만원" : "");
    }
    return num.toLocaleString() + "만원";
}

calc();

function updateSliderBg(el) {
    const min = el.min ? el.min : 0;
    const max = el.max ? el.max : 100;
    const val = el.value;
    const percent = ((val - min) / (max - min)) * 100;
    
    // 메인 테마 색상으로 수정 (블루/옐로우 톤)
    el.style.background = `linear-gradient(
        to right,
        #ffff00, /* 옐로우 */
        #3b9dff, /* 메인 블루 */
        #1e4fd8 ${percent}%, /* 서브 블루 */
        #123a8f ${percent}%  /* 메인 다크 블루 (채워지지 않은 부분) */
    )`;
}

// 초기 한번 실행
updateSliderBg(loanEl);
// 슬라이더 움직일 때마다 실행
loanEl.addEventListener("input", () => {
    calc(); // 기존 계산 함수
    updateSliderBg(loanEl);
});

function openPrecheck() {
    // 1. 체크박스 요소 가져오기
    const policy = document.getElementById("policy");
    
    // 2. 동의 안 했을 경우 알림 띄우고 함수 종료(작동 중지)
    if (policy && !policy.checked) {
        alert("개인정보처리방침에 동의해주세요.");
        return; 
    }

    // 3. 동의했을 경우 폼 화면 열기
    document.getElementById("form_wrap-sec").classList.add("active");
    document.querySelector(".wrap").classList.add("hide");   
    window.scrollTo(0, 0);                                     
}

document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("form_wrap-sec").classList.remove("active");
        document.body.style.overflow = "";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    calc();
});

function updateMiniGraph(bad, good) {
    const max = Math.max(bad, good, 1);
    const badPercent = bad / max;
    const goodPercent = good / max;
    const badBar = document.getElementById("badBar");
    const goodBar = document.getElementById("goodBar");
    
    // 최초 1회 → 바로 채워진 상태
    if (isFirstRender) {
        badBar.style.transition = "none";
        goodBar.style.transition = "none";
        badBar.style.transform = `scaleY(${badPercent})`;
        goodBar.style.transform = `scaleY(${goodPercent})`;
        isFirstRender = false;
        return;
    }
    
    // 이후부터는 리셋 → 애니메이션
    badBar.style.transition = "none";
    goodBar.style.transition = "none";
    badBar.style.transform = "scaleY(0)";
    goodBar.style.transform = "scaleY(0)";
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            badBar.style.transition = "transform 0.5s cubic-bezier(.34,1.56,.64,1)";
            goodBar.style.transition = "transform 0.6s cubic-bezier(.34,1.56,.64,1)";
            badBar.style.transform = `scaleY(${badPercent})`;
            goodBar.style.transform = `scaleY(${goodPercent})`;
            if (good > bad) {
                // 글로우 효과도 메인 블루 컬러로 변경
                goodBar.style.boxShadow = "0 0 20px rgba(59, 157, 255, 0.9)";
                goodBar.style.transform += " scale(1.05)";
            } else {
                goodBar.style.boxShadow = "none";
            }
        });
    });
}
/* ===========================
    Multi-step 처리 로직
=========================== */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('myModal1');
    if (!form) return; // 폼이 없으면 에러 없이 무시하도록 방어

    const steps = form.querySelectorAll('.step');
    let currentStep = 0;

    function showStep(index) {
        if (!steps.length) return;
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        const activeStep = steps[index];
        const progress = activeStep.querySelector('.progress');
        if (progress) {
            // 방어 코드: step이 1개일 때 0으로 나누는 것 방지
            const maxIndex = Math.max(1, steps.length - 1);
            
            // 처음엔 20%부터 시작, 끝날 땐 90%까지만 차도록 변경 (20 + 70 = 90)
            const percent = 20 + (index / maxIndex) * 70;
            
            progress.style.width = '0%';
            progress.parentElement.setAttribute('data-percent', Math.round(percent) + '%');
            setTimeout(() => { progress.style.width = percent + '%'; }, 30);
        }
    }
    function validateStep(index) {
        const current = steps[index];
        if (!current) return false;
        
        const requiredRadios = current.querySelectorAll('input[type="radio"][required]');
        if (requiredRadios.length) {
            const name = requiredRadios[0].name;
            if (!current.querySelector(`input[type="radio"][name="${name}"]:checked`)) {
                alert('항목을 선택해주세요.');
                return false;
            }
        }

        const singleInputs = current.querySelectorAll('input[type="text"][required]');
        for (const input of singleInputs) {
            if (!input.value.trim()) {
                alert('필수 입력 항목을 입력해주세요.');
                input.focus();
                return false;
            }
        }

        return true;
    }

    // 안전한 이벤트 위임 방식으로 이전/다음 버튼 처리
    form.addEventListener('click', (e) => {
        if (e.target.matches('.next')) {
            if (validateStep(currentStep) && currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        }
        if (e.target.matches('.prev')) {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        }
    });

    // 최종 Submit 처리
    const submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', (e) => {
        if (!validateStep(currentStep)) {
            e.preventDefault();
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        let M_data = "";
        const option1 = form.querySelector('input[name="option1"]:checked');
        if (option1) M_data += "사업장형태: " + option1.value;
        const option2 = form.querySelector('input[name="option2"]:checked');
        if (option2) M_data += " / 업종: " + option2.value;
        // const option3 = form.querySelector('input[name="option3"]:checked');
        // if (option3) M_data += " / 지역: " + option3.value;

        if (M_data.length > 0) {
            const existingInput = form.querySelector('input[name="M_data"]');
            if (existingInput) existingInput.remove();
            
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "M_data";
            input.value = M_data.trim();
            form.appendChild(input);
        }
    });

    // 초기화 실행
    showStep(currentStep);
});