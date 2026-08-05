function toggleAgreement() {
    const agreeBox = document.getElementById('agreeBox');
    agreeBox.classList.toggle('is-open');
}
function startConsultTimer() {
    function updateTimer() {
        const now = new Date();
        let target = new Date();

        // 목표 시간: 오늘 오후 6시 (18시 00분 00초)
        target.setHours(18, 0, 0, 0);

        // 만약 현재 시간이 오늘 오후 6시 이후라면, 목표 시간을 '다음날 오후 6시'로 설정
        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }

        // 남은 시간 계산 (밀리초 단위)
        const diff = target - now;

        // 시, 분, 초 변환
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // 두 자리 수 포맷팅 (예: 3 -> 03)
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        // 타이머 텍스트 업데이트
        const timerElem = document.getElementById('consultTimer');
        if (timerElem) {
            timerElem.textContent = `${hStr}시간 ${mStr}분 ${sStr}초 남음`;
        }
    }

    // 즉시 실행 후 1초마다 반복 업데이트
    updateTimer();
    setInterval(updateTimer, 1000);
}

$(document).ready(function() {
    startConsultTimer();
    AOS.init({
        duration: 800,     // 애니메이션 지속 시간 (ms)
        easing: 'ease-out-cubic', // 부드러운 가속도
        once: true,        // 스크롤 올렸다 내려도 1회만 동작 (모바일 리소스 절약)
        offset: 120        // 스크롤 요소 감지 지점 (px)
    });
    // 카드 클릭 인터랙션 대상 선택자
    const cardSelectors = '.feature-list li, .program-card, .flow-step, .invest-card, .scenario-card, .faq-item';
    $(document).on('click', cardSelectors, function() {
        // 부모 리스트/컨테이너를 찾아서 그 안의 다른 카드는 .card-active 제거
        $(this).siblings().removeClass('card-active');
        
        // 현재 클릭한 카드에 .card-active 토글 (이미 켜져있을 때 다시 누르면 해제 원할 경우 toggleClass, 무조건 켜짐을 원하면 addClass)
        $(this).toggleClass('card-active');
    });
    // 1. 성명 한글 입력 제한 (천지인 키보드 대응)
    $('.consult-form input[placeholder="성명"]').on('input', function() {
        const regExp = /[^가-힣ㄱ-ㅎㅏ-ㅣ\u318D\u119E\u11A2\s]/g;
        this.value = this.value.replace(regExp, '');
    });

    // 2. 전화번호 숫자 전용 & 4자리 자동 포커스 이동
    const $phoneInputs = $('.phone-inputs input[maxlength="4"]');
    $phoneInputs.on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length === 4) {
            const index = $phoneInputs.index(this);
            if (index < $phoneInputs.length - 1) {
                $phoneInputs.eq(index + 1).focus();
            }
        }
    });

    // 백스페이스 시 이전 칸 이동
    $phoneInputs.eq(1).on('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0) {
            $phoneInputs.eq(0).focus();
        }
    });

    // 3 & 4. 사업자 유형 및 업종 버튼 클릭 이벤트
    $('.btn-grid-2, .btn-grid-3').on('click', '.type-btn', function() {
        $(this).siblings('.type-btn').removeClass('active');
        $(this).addClass('active');

        const selectedValue = $(this).text().trim();

        // 사업자 유형 버튼인 경우
        if ($(this).parent().hasClass('btn-grid-2')) {
            $('#M_data0').val(selectedValue);
        } 
        // 업종 버튼인 경우
        else if ($(this).parent().hasClass('btn-grid-3')) {
            $('#M_job').val(selectedValue);
        }
    });

    // ==========================================
    // 5. 폼 제출 및 M_data 결합 전송
    // ==========================================
    $('form[name="Write_form"]').on('submit', function(e) {
        e.preventDefault(); // 기본 submit 중단 후 커스텀 처리
        const fm = this;

        const nameVal = $(fm).find('input[placeholder="성명"]').val().trim();
        const phone2 = $phoneInputs.eq(0).val().trim();
        const phone3 = $phoneInputs.eq(1).val().trim();
        const isAgreed = $('#agreeCheck').is(':checked');

        // 입력값 검증
        if (!nameVal) {
            alert('성명을 입력해 주세요.');
            $(fm).find('input[placeholder="성명"]').focus();
            return false;
        }

        if (phone2.length < 3 || phone3.length < 4) {
            alert('전화번호를 올바르게 입력해 주세요.');
            $phoneInputs.eq(0).focus();
            return false;
        }

        if (!isAgreed) {
            alert('개인정보 처리방침에 동의해 주세요.');
            return false;
        }

        // --- 모든 관문 통과 시 데이터 결합 및 전송 ---
        var M_data = "";
        M_data += " 사업자 : " + fm.M_data0.value;
        M_data += " / 업종 : " + fm.M_job.value;

        // 중복 생성을 방지하기 위해 기존 hidden 필드가 있는지 확인 후 처리
        var hiddenInput = fm.querySelector('input[name="M_data"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = "M_data";
            fm.appendChild(hiddenInput);
        }
        hiddenInput.value = M_data;

        // 최종 서버 전송
        fm.submit();
    });
});