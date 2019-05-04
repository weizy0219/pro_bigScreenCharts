/**
 * Created by Administrator on 2019/4/19.
 */

const Cfg = {
    designW: 1920, //设计图宽度
    designH: 1080, //设计图高度
    getWeatherPeriod: 5, //天气预报更新周期（分）
    chartRefreshPeriod: 10, // 图表刷新周期（秒）
    season: 'default',//配色方案，部分色彩参考 http://rmco.jp/coloringroom/haisyoku_rei/haisyoku_haru.html
    colors: {
        default: ['lightskyblue', 'orange', 'yellow', 'greenyellow',
            'mediumturquoise','mediumpurple'],
/*
        default: ['#4cb4e7', '#ffc09f', '#ffee93', '#e2dbbe',
            '#a3a380'],
*/
        spring: ['#FFFFE6', '#FA8C8C', '#FAAAC8', '#FAC8C8',
            '#BEDC6E', '#6E6464'],
        summer: ['#DCFFFF', '#FF5200', '#FFAE00', '#007AFF',
            '#00BF05', '#505064'],
        autumn: ['#FAE6DC', '#782323', '#783723', '#A05027',
            '#A5912D', '#283C14'],
        winter: ['#F5F5FA', '#96822D', '#6E5A19', '#BECDEB',
            '#E1E1F0', '#281E1E'],
    }
};
let hasGetWeather = false;
let scale = 1;
let [pageH, pageW] = [$(window).height(), $(window).width()];
const Public = {
    ajaxHeaders: {
        token: ''
    },
    hasVal(val) {
        if (val === null) {
            return '-';
        }
        return val;
    },
    chartsResize(charts) {
        $(window).resize(() => {
            Object.keys(charts).forEach(item => {
                charts[item].resize();
            })
        });
    },
    /**
     *
     * @param charts
     * @param t 默认刷新时间（秒）
     * @param noRefresh 无需刷新的图表
     * @param someRefresh 指定要刷新的图表，有重复指定的图表时优先权高于noRefresh
     */
    chartsReDraw(charts, t = Cfg.chartRefreshPeriod, noRefresh, someRefresh) {
        let counter = setInterval(() => {
            Object.keys(charts).forEach(item => {
                if (noRefresh.includes(item) && !someRefresh.includes(item)) return;
                let chart = charts[item];
                let opt = chart.getOption();
                chart.clear();
                chart.setOption(opt);
            })
        }, t * 1000)

    }
};

// 自定义方法
(function initTools() {
    $.fn.extend({
        /**
         * 将文本转为数字并保留相应小数位数
         * @param n 小数位数
         * @param power 数据缩放到10的多少次方
         * @param str 后面可以跟上个字符串，比如‘%’
         */
        str2NumFixed: function (n, power, str = '') {
            $.each($(this), function () {
                $(this).text(Public.hasVal(parseFloat($(this).text() + 'e' + power).toFixed(n) + str));
            })
        }
    })
})();

//jsonP
function onBack(data) {
}

//获取天气情况
function getWeather(currTime) {
    // 获取地理位置
    $.get({
        url: 'https://api.asilu.com/weather_v2/',
        type: 'get',
        dataType: 'jsonp',  // 请求方式为jsonp
        jsonpCallback: "onBack",    // 自定义回调函数名
        success: function (data) {
            const city = data.forecasts[0].city;

            //如果以后找到合适的天气图标将替代和风天气
            /*
            let temperatureTxt = '';
            let daily_forecast = data.forecasts[0].casts[0];
            let [code, txt] = ['', ''];
            if ((currTime.getHours() >= 6) && (currTime.getHours() < 18)) {
                code = daily_forecast.cond_code_d;
                txt = daily_forecast.dayweather;
                temperatureTxt = daily_forecast.nighttemp + "℃~" + daily_forecast.daytemp + "℃";
            } else {
                code = daily_forecast.cond_code_n;
                txt = daily_forecast.nightweather;
                temperatureTxt = daily_forecast.daytemp + "℃~" + daily_forecast.nighttemp + "℃";
            }
            $("#weather").html(txt + '&emsp;' + city);
            $("#temperature").text(temperatureTxt);
*/
            // $("#weatherIcon").css('background-image', `url("https://cdn.heweather.com/cond_icon/${code}.png")`);


            // 官方文档 http://www.heweather.com/douments/api/s6/weather-forecast 因为要用图标，所以暂时还是用了和风天气
            $.get(`https://free-api.heweather.com/s6/weather/forecast?location=${city}&key=7e07c4303b4841e6b1595dca70f9d4a7`, data => {
                let temperatureTxt = '';
                let daily_forecast = data.HeWeather6[0].daily_forecast[0];
                let [code, txt] = ['', ''];
                if ((currTime.getHours() >= 6) && (currTime.getHours() < 18)) {
                    code = daily_forecast.cond_code_d;
                    txt = daily_forecast.cond_txt_d;
                    temperatureTxt = daily_forecast.tmp_min + "℃~" + daily_forecast.tmp_max + "℃";
                } else {
                    code = daily_forecast.cond_code_n;
                    txt = daily_forecast.cond_txt_n;
                    temperatureTxt = daily_forecast.tmp_max + "℃~" + daily_forecast.tmp_min + "℃";
                }
                $("#weather").html(txt + '&emsp;' + city);
                $("#temperature").text(temperatureTxt);
                $("#weatherIcon").css('background-image', `url("https://cdn.heweather.com/cond_icon/${code}.png")`);
            })
        }
    })

}

// 页面顶部时间
let colonShow = true;

function setHeaderTime() {
    setTimeout(function () {
        let t = new Date();
        let [year, mon, date, hour, min, sec, milliSec] = [
            t.getFullYear(),
            t.getMonth() + 1,
            t.getDate(),
            t.getHours(),
            t.getMinutes(),
            t.getSeconds(),
            t.getMilliseconds()
        ];
        let timeHtml = `
                <span class="date"> ${year}-${mon}-${date}</span>
                <span class="digital-num">
                    ${hour} 
                    <span class="colon" style="">${colonShow ? ' :' : '&nbsp;'}</span>
                    ${(min + "").padStart(2, '0')}
                </span>`;
        colonShow = !colonShow;
        $("#headerTime").html(timeHtml);
        if (!hasGetWeather) {
            getWeather(t);
            hasGetWeather = true;
        } else {
            if (min % Cfg.getWeatherPeriod === 0 && sec === 0 && milliSec < 500) {
                getWeather(t);
            }
        }
        console.log(sec)
        setHeaderTime();
    }, 500)
}

setHeaderTime();

function pageResize() {
    [pageH, pageW] = [$(window).height(), $(window).width()];
    if (pageW / pageH > 16 / 9) { //扁
        $("#container").css({width: pageH * 16 / 9, height: '100%'});
        scale = pageH / 1080;
        // console.info("扁")
    } else { //方
        $("#container").css({height: pageW * 9 / 16, width: '100%'});
        scale = pageW / 1920;
        // console.info("方")
    }
    $("html").css("font-size", scale * 16 + "px").css("opacity", 1);
    // console.log("~~~~~~~~~窗口高度：" + pageH + ",\n宽度:" + pageW + " \nbody字号：" + scale)
}

pageResize();
$(window).resize(() => {
    pageResize();
});

//设置请求header
function setHeader(request) {
    request.setRequestHeader("X-Sign", xSign);
    request.setRequestHeader("X-Token", xToken);
}

