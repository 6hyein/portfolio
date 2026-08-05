$(document).ready(function(){    
    // qna list
    $(".sec2 .tabArea button").click(function(){
        const tabIdx = $(this).index();
        $(this).addClass("on").siblings("button").removeClass("on");
        $(".qnaList dl").eq(tabIdx).addClass("on").siblings("dl").removeClass("on");
    });
    // fixed form
    $(".fixedForm .closeBtn").click(function(){
        $(this).toggleClass("on");
        const formHeight = $(".fixedForm").innerHeight();
        if($(this).hasClass("on")){
            $(".fixedForm").css("bottom",-formHeight);
        }else{
            $(".fixedForm").css("bottom",0);
        }
    });
    // animate number 
    const numbers = $(".numberList .number b");
    let txtTop = $(".numberList").offset().top - 500;
    let check = true;
    numbers.each((idx,item) => {
        const num = Number($(item).html());
        $(item).html(0); // 숫자 리셋
        $(window).scroll(function(){
            const scrollTop = $(window).scrollTop();
            if (check && scrollTop > txtTop ) {
                $(item).animateNumber({number : num});
                if(idx === 2) check = false;
            } 
        });        
    });
    // slick sec2 reviewList
    $('.sec2 .reviewList').slick({
        infinite: false,
        arrows : false,
        slidesToShow: 1.3,
        slidesToScroll: 1,
    });
    // slick txtLine
    $(".txtLine").slick({
        autoplay: true,    
        autoplaySpeed: 0, 
        arrows : false,
        slidesToShow: 7,
        accessibility: false,
        pauseOnHover:false,
        pauseOnFocus: false,   
        pauseOnDotsHover: false, 
        verticalSwiping: false,  
        fade: false,   
        cssEase: 'linear'
    });
    // 병뚜껑 효과
    setTimeout(function(){$(".sec1").removeClass("action")}, 300);
    
    // 스크롤애니메이션
    AOS.init({
        offset: 200,
	    duration: 600,
    });
});
$(window).scroll(function(){
	// text animation
    const txtAny = $('.txtAny');
    const scrollTop = $(window).scrollTop();
    txtAny.each((idx,item) => {
        let txtTop = $(item).offset().top - 500;
        if (scrollTop > txtTop) {
            $(item).addClass('on');
        } else {
            $(item).removeClass('on');
        }
    });    
    
});
/**
 * form
 */
function check_NUM(input_number)
{
	var regexp = /[0-9]/;
	for( var i=0; i<input_number.length; i++){
		if(input_number.charAt(i) != " " && regexp.test(input_number.charAt(i)) == false )
			return false;
	}
	return true;
}
//자동포커스 이동
function Auto_focus_next(check_focus,next_focus,length_size)
{
	if(check_focus.value.length>=length_size)
		next_focus.focus();
}
function Request_Now_input_check3(fm)
{
	phone_OK_check=0;
	tel_OK_check=0;
	
	phone_NUM_check=0;
	tel_NUM_check=0;

	if(fm.M_phone)
	{
		if(fm.M_phone.value.trim().length>5)	 phone_OK_check=1;
		if(check_NUM(fm.M_phone.value.trim()))	phone_NUM_check=1;
	}
		
	Agree_check=1;
	if(!fm.M_agree_check1.checked ){ 
        Agree_check=0;
    } 
    console.log(Agree_check);

	in_check=1;
	if(fm.M_name.value.trim()==""){	alert("성명을 입력하세요.");	fm.M_name.focus();}		 
    else if(!phone_OK_check) { alert("휴대폰번호를 입력하세요.");	 if(fm.M_phone1){fm.M_phone1.focus();}}
	else if(!phone_NUM_check) {	alert("휴대폰번호에는 숫자만 입력해주세요."); if(fm.M_phone1){fm.M_phone1.focus();}}
	else if(Agree_check == 0) { alert("이용 약관에 동의 해주세요.");		}
	else
	{
        alert("작성이 완료 되었습니다.");
		fm.submit();
	}
}