document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. 팝업(개인정보처리방침, 이용약관) 열기/닫기 처리 (jQuery 사용)
    // ==========================================
    $('.btn-policy').on('click', function(e) {
        e.preventDefault(); 
        
        // 클릭한 버튼의 data-target 속성을 가져와 해당 모달 열기
        var targetModal = $(this).data('target'); 
        
        $('#modal-overlay').fadeIn(200); 
        $(targetModal).fadeIn(200);      
        $('body').addClass('modal-open'); // 뒤 배경 스크롤 막기
    });

    $('.btn-close-modal, #modal-overlay').on('click', function() {
        $('#modal-overlay').fadeOut(200);
        $('.modal-wrap').fadeOut(200);
        $('body').removeClass('modal-open'); // 뒤 배경 스크롤 다시 허용
    });
    // ==========================================
    // 휴대폰 번호 입력 시 다음 칸 자동 이동 로직
    // ==========================================
    const phone1 = document.querySelector('input[name="M_phone1"]');
    const phone2 = document.querySelector('input[name="M_phone2"]');
    const phone3 = document.querySelector('input[name="M_phone3"]');

    if (phone1 && phone2 && phone3) {
    // 1번째 칸 (010 -> 3자리 입력 시 2번째 칸으로 이동)
    phone1.addEventListener('input', (e) => {
        // 숫자 외 제거
        e.target.value = e.target.value.replace(/[^0-9]/g, ''); 
        if (e.target.value.length >= 3) {
            phone2.focus();
        }
    });

    // 2번째 칸 (4자리 입력 시 3번째 칸으로 이동)
    phone2.addEventListener('input', (e) => {
        // 숫자 외 제거
        e.target.value = e.target.value.replace(/[^0-9]/g, ''); 
        if (e.target.value.length >= 4) {
            phone3.focus();
        }
    });

    // 3번째 칸 (숫자 외 제거만 처리)
    phone3.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // [편의 기능] 지우기(Backspace) 누를 때 이전 칸으로 돌아가기
    phone2.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && phone2.value.length === 0) {
            phone1.focus();
        }
    });

    phone3.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && phone3.value.length === 0) {
            phone2.focus();
        }
    });
}

    // ==========================================
    // 2. 폼 데이터 병합 및 제출(Submit) 처리
    // ==========================================
    const form = document.querySelector('#myModal1');
    
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', (e) => {
            // 1. 기본 폼 전송(새로고침 및 자동 전송)을 우선 완전히 막습니다.
            e.preventDefault(); 

            // 2. 중복 제출을 막기 위해 버튼 비활성화 및 텍스트 변경
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "제출 중...";
            }

            let M_data = "";
            
            // 3. 사업자 종류 및 업종 데이터 추출
            const bizType = form.querySelector('input[name="biz_type"]:checked');
            if (bizType) {
                M_data += "사업장형태: " + bizType.value;
            }
            
            const industry = form.querySelector('input[name="industry"]:checked');
            if (industry) {
                M_data += " / 업종: " + industry.value;
            }

            // 4. 추출된 데이터를 hidden input으로 만들어 폼에 안전하게 삽입
            if (M_data.length > 0) {
                const existingInput = form.querySelector('input[name="M_data"]');
                if (existingInput) {
                    existingInput.remove(); 
                }
                
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "M_data";
                input.value = M_data.trim(); 
                form.appendChild(input);
            }
            
            // 5. M_data 세팅이 모두 끝난 후, 자바스크립트로 직접 폼 전송을 실행합니다.
            form.submit();
        });
    }

    // ==========================================
    // 3. 헤더 스크롤 고정 및 색상 변경
    // ==========================================
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            // 스크롤이 50px 이상 내려가면 scrolled 클래스 추가
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ==========================================
    // 4. 통계 섹션 숫자 카운팅 애니메이션
    // ==========================================
    const counters = document.querySelectorAll('.count-num');
    let hasCounted = false; // 한 번만 실행되도록 제어하는 변수

    const runCounter = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 1500; // 애니메이션 진행 시간 (1.5초)
            const stepTime = Math.abs(Math.floor(duration / target)); // 숫자 1당 걸리는 시간 계산
            
            // 숫자가 너무 크면 버벅일 수 있으므로 최소 인터벌 시간을 20ms로 제한
            const intervalTime = stepTime < 20 ? 20 : stepTime; 
            const increment = target / (duration / intervalTime);
            
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    // 목표 숫자에 도달하면 콤마(,) 찍어서 출력하고 타이머 종료
                    counter.innerText = target.toLocaleString('ko-KR');
                    clearInterval(timer);
                } else {
                    counter.innerText = Math.ceil(current).toLocaleString('ko-KR');
                }
            }, intervalTime);
        });
    };

    // 통계 섹션이 화면에 보일 때 카운팅 실행 (IntersectionObserver 활용)
    const statsSection = document.querySelector('.stats-list');
    
    if (statsSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            // 요소가 화면에 50% 이상 보이고, 아직 카운팅 전이라면
            if (entries[0].isIntersecting && !hasCounted) {
                runCounter();
                hasCounted = true; // 다시 스크롤을 올려도 재실행 방지
                observer.unobserve(statsSection); 
            }
        }, { threshold: 0.5 }); // 화면에 50% 노출 시 실행

        observer.observe(statsSection);
    } else if (statsSection) {
        // 구형 브라우저 대응 (바로 실행)
        runCounter();
        hasCounted = true;
    }

});