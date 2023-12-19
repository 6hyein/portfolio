/* 바 그래프 */
const myChart2 = document.getElementById("myChart");
const chartArea = myChart2.getContext('2d');
let labelsList = myChart2.children;
let labels = Array();
let datas = Array(); 
let backgroundColors = Array();
let colors = Array();

for (let val in labelsList){
    if( !isNaN(val) ){
        labels.push(labelsList[val].getAttribute('data_text'));
        datas.push(labelsList[val].getAttribute('data-value'));
        colors.push("rgb("+labelsList[val].getAttribute('data-color')+")");
        backgroundColors.push("rgba("+labelsList[val].getAttribute('data-color')+",0.2)");
    }
}
var myChart = new Chart(chartArea, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'skill level',
            data: datas,
            backgroundColor: backgroundColors,
            borderColor: colors,
            borderRadius: 10,
            barThickness:30,
            borderWidth: 2
        }]
    },
    options: {
        // responsive: false,
        indexAxis: 'y',
        plugins:{
            legend: {
                display: false
            },
            tooltip: {
                enabled: false // <-- this option disables tooltips
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                }
            }
        }
    }
});
/* fullpage */
new fullpage('#fullpage', {
    // licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
    scrollOverflow:false
});
/* 마우스 효과 */
const circle = document.getElementById("circle_pointer");
let mouseX = 0
let mouseY = 0
let circleX = 0
let circleY = 0
let deg = 0
let speed = 0.06

const animate = () => {
    let distX = mouseX - circleX
    let distY = mouseY - circleY
    let translatedValue = `translate3d(${circleX}px, ${circleY}px, 0 ) rotate(${deg}deg)`;

    circleX = circleX + (distX * speed)
    circleY = circleY + (distY * speed)    
    deg = deg < 360 ? deg + 1 : 0;

    circle.style.transform = translatedValue;

    requestAnimationFrame(animate)
}

animate();
// 마우스 움직일 때
document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - circle.offsetWidth / 4;
        mouseY = e.clientY - circle.offsetHeight / 4;
    }
);
// 터치할 때
document.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].pageX - circle.offsetWidth / 4;
        mouseY = e.touches[0].pageY - circle.offsetHeight / 4;
    }
);

// 버튼 클릭시 링크 이동
let btn = document.querySelectorAll(".btn");
btn.forEach((element) => {
    // 버튼인 경우만
    if(element.tagName === "BUTTON"){
        element.onclick = () => {
            // 해당 링크로 페이지 이동
            let btnHref = element.getAttribute('href');
            window.location.href = btnHref;
        }
    }
});
// 
// http://rwdb.kr/interactionbg-2/ - 배경 움직이는 효과
