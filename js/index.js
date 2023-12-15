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
let speed = 0.06

const animate = () => {
    let distX = mouseX - circleX
    let distY = mouseY - circleY
    let translatedValue = `translate3d(${circleX}px, ${circleY}px, 0 )`;
    
    circleX = circleX + (distX * speed)
    circleY = circleY + (distY * speed)    
    
    circle.style.transform = translatedValue;
    
    requestAnimationFrame(animate)
  }
  
  animate();
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - circle.offsetWidth / 4;
    mouseY = e.clientY - circle.offsetHeight / 4;
  }
);

// https://mu08.tistory.com/139 - 배경 움직이는 효과
