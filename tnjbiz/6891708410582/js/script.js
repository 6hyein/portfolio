//var section1;
var section = Array();
var animationEnd = Array();
var isPlay1 = false;
var windowWidth;
var windowHight
var scrollTop;
$(document).ready(function(){
    var oldNum = $("#countUp").text()// 원래
    var basicNum = oldNum.replace(/[^0-9]/g,''); // 숫자만
    msgTimer();
    setInterval(msgTimer,1000);
    onResize();
    onListAni();
    $(window).resize(function () {
        onResize();
    });    
    $(window).scroll(function(){
        scrollTop = $(window).scrollTop();
        onListAni();
    });
    
    /*
     *  리스트 체크
     */
    $(".dataArea label").click(function(){
        if($(this).children("input").is(":checked")){
            $(this).addClass("on").siblings("label").removeClass("on");
        }
    });

    /*
     * 타이머 
     */
    function msgTimer() {
        var stDate = new Date().getTime();//현재날짜
        var now = new Date();
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth()+1;
        var nowDate = now.getDate();
        var edDate =nowYear+"/"+nowMonth+"/"+nowDate + " 17:59:59";
        edDate = new Date(edDate).getTime();
        var RemainDate = edDate - stDate;//남은시간
        var hours = Math.floor((RemainDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);

        hours = hours >= 10 ? hours : "0" + hours; 
        miniutes  = miniutes  >= 10 ? miniutes  : "0" + miniutes ; 
        seconds = seconds >= 10 ? seconds : "0" + seconds; 
        
        $(".hours").html(hours);
        $(".miniutes").html(miniutes);
        $(".seconds").html(seconds);
    }
    /**
     *  개인정보 처리방침동의서 나오게
     */
    $(".agreeShow").click(function(){
        $(".agreement").slideToggle();
    });
    /*
     *  section 높이 측정 
     */    
    function onResize(){
        windowWidth = $(window).innerWidth();
        windowHight = $(window).innerHeight();
        scrollTop = $(window).scrollTop();
        
        for(var i = 1; i<=5; i++ ){
            section[i] = $(".sec"+i).offset().top - (windowHight / 5 * 4);
            animationEnd[i] = true;
        }
        //부드럽게 이동
        $(".btn").click(function () {
            $('html,body').stop().animate({scrollTop: $(".sec5").offset().top}, 500);
        });
    }

    /*
     * 애니메이션 
     */
    function onListAni(){
        for(var i = 2; i<=4; i++){
            if(animationEnd[i] && scrollTop >= section[i] && scrollTop < section[i+1]){
                animationEnd[i] = false;
                var num = 0;
                // 제목
                $(`.sec${i} h2`).addClass("topActive");

                // 제목 리스트
                $(`.sec${i} .txtList li`).each(function(idx, item){
                    setTimeout(function(){
                        $(item).addClass("topActive");
                    }, 100 + 50 * num++);
                });
                if(i === 4){
                    setTimeout(function(){
                        $(`.sec4 .info`).addClass("topActive");
                    }, 100 + 50 * num++);
                } 
                if(i === 2){
                    //숫자 카운트업      
                    $('#countUp').prop('number', 10).animateNumber({
                            number: basicNum,
                            numberStep: function (now, tween) {
                                var target = $(tween.elem),
                                    rounded_now = Math.round(now).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                                target.text(now === tween.end ? oldNum : rounded_now);
                                //console.log(tween.end);
                            }
                        },
                        2000,
                        'linear'
                    );
                    setTimeout(function(){
                        $(`.sec2 .topTxtArea img`).addClass("scaleActive");
                    }, 100 + 50 * num++);
                    setTimeout(function(){
                        $(`.sec2 h4`).addClass("topActive");
                    }, 100 + 100 * num++);
                    setTimeout(function(){
                        $(`.sec2 .imgArea`).addClass("topActive");
                    }, 100 + 100 * num++);
                    setTimeout(function(){
                        $(`.sec2 .info`).addClass("topActive");
                    }, 100 + 100 * num++);
                }                
                // 네모리스트
                $( `.sec${i} .userList li`).each(function(idx, item){
                    setTimeout(function(){
                        $(item).addClass("leftActive");
                    }, 100 + 100 * num++);
                });
                // 하단
                if(i === 4){
                    setTimeout(function(){
                        $(`.sec4 .bottomTxt`).addClass("topActive");
                    }, 100 + 50 * num++);
                }
                if(i === 3){
                    setTimeout(function(){
                        $(`.sec3 .btn`).addClass("topActive");
                    }, 100 + 50 * num++);
                }                      
            }
        }
    }
    
});
function cdcheck(obj){
    var pressedKey = String.fromCharCode(event.keyCode).toLowerCase();
    if (event.ctrlKey && (pressedKey == "c" || pressedKey == "v")) {
        event.returnValue = false;
    }
    
    var regExp = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\　ㅤ(\=]/gi;
    if( regExp.test(obj.value) ){
       obj.value = obj.value.substring( 0 , obj.value.length - 1 ); 
    }
}
function Auto_focus_next(check_focus,next_focus,length_size)
{
	if(check_focus.value.length>=length_size)
		next_focus.focus();
}
function check_NUM(input_number)
{
	var regexp = /[0-9]/;
	for( var i=0; i<input_number.length; i++){
		if(input_number.charAt(i) != " " && regexp.test(input_number.charAt(i)) == false )
			return false;
	}
	return true;
}
function Request_Now_input_check(fm)
{
	phone_OK_check=0;
	tel_OK_check=0;
	phone_NUM_check=0;
	tel_NUM_check=0;
    job_check = 0;
    area_check = 0;
	if(fm.M_phone1)
	{
		if(fm.M_phone1.value.trim().length>2&&fm.M_phone2.value.trim().length>3&&fm.M_phone3.value.trim().length>3)	 phone_OK_check=1;
		if(check_NUM(fm.M_phone1.value.trim())&&check_NUM(fm.M_phone2.value.trim())&&check_NUM(fm.M_phone3.value.trim()))	phone_NUM_check=1;
	}

	Agree_check=0;
	if(fm.M_agree)
	{
		if(fm.M_agree.checked==false)
			Agree_check=1;
	}

	in_check=1;
	if(fm.M_name.value.trim()==""){					
		alert("성명을 입력하세요.");	
		fm.M_name.focus();			
	}
	else if(!tel_NUM_check&&!phone_NUM_check)	{	alert("휴대폰번호에는 숫자만 입력해주세요.");	 if(fm.M_phone1){fm.M_phone1.focus();}}
	else if(!tel_OK_check&&!phone_OK_check){	
		alert("휴대폰번호를 입력하세요.");	 
		if(fm.M_phone1){
			fm.M_phone1.focus();
		}
	}
	else if(Agree_check){ 
		alert("이용 약관에 동의 해주세요.");		
	}
	else
	{
        if(fm.M_data0.value.length > 1 || fm.M_data1.value.length > 1 || fm.M_job.value.length > 1){
            var M_data = "";
            if(fm.M_data0.value.length > 1){
                M_data += " 사업자 : " + fm.M_data0.value;
            }
            if(fm.M_job.value.length > 1){
                M_data += " 업종 : " + fm.M_job.value;
            }
            if(fm.M_data1.value.length > 1){
                M_data += " 자금용도 : " + fm.M_data1.value;
            }
            
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "M_data";
            input.value = M_data;
            Write_form.appendChild(input);
        }
		fm.submit();
	}
}
