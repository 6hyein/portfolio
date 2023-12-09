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