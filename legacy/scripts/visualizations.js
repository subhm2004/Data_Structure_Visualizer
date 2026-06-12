
var speed = 1000;

inp_aspeed.addEventListener("input", vis_speed);

function vis_speed() {
    var array_speed = inp_aspeed.value;
    switch (parseInt(array_speed)) {
        case 1: speed = 1; break;
        case 2: speed = 10; break;
        case 3: speed = 100; break;
        case 4: speed = 1000; break;
        case 5: speed = 10000; break;
    }
    delay_time = 10000 / (Math.floor(array_size / 10) * speed);
}

var delay_time = 10000 / (Math.floor(array_size / 10) * speed);
var c_delay = 0;

var colorMap = {
    "blue": "bar-default",
    "yellow": "bar-compare",
    "red": "bar-swap",
    "green": "bar-sorted"
};

function div_update(cont, height, color) {
    window.setTimeout(function () {
        var barClass = colorMap[color] || "bar-default";
        cont.className = "bar " + barClass;
        cont.style = "margin:0% " + margin_size + "%; width:" + (100 / array_size - (2 * margin_size)) + "%; height:" + height + "%;";
    }, c_delay += delay_time);
}

function enable_buttons() {
    window.setTimeout(function () {
        for (var i = 0; i < butts_algos.length; i++) {
            butts_algos[i].classList = [];
            butts_algos[i].classList.add("butt_unselected");
            butts_algos[i].disabled = false;
            inp_as.disabled = false;
            inp_gen.disabled = false;
            inp_aspeed.disabled = false;
        }
        setStatus("ready", "Ready");
        topbarHint.textContent = "Select an algorithm to begin visualization";
    }, c_delay += delay_time);
}
