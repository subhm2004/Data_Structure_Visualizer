
var inp_as = document.getElementById('a_size');
var array_size = inp_as.value;
var inp_gen = document.getElementById("a_generate");
var inp_aspeed = document.getElementById("a_speed");
var butts_algos = document.querySelectorAll(".algos button");

var div_sizes = [];
var divs = [];
var margin_size;
var cont = document.getElementById("array_container");
cont.style = "flex-direction:row";

var sizeValue = document.getElementById("size_value");
var speedValue = document.getElementById("speed_value");
var statusBadge = document.getElementById("status_badge");
var topbarHint = document.querySelector(".topbar-hint");

var speedLabels = ["Ultra Slow", "Slow", "Medium", "Fast", "Ultra Fast"];

function updateSizeDisplay() {
    sizeValue.textContent = array_size;
}

function updateSpeedDisplay() {
    speedValue.textContent = speedLabels[inp_aspeed.value - 1];
}

function setStatus(state, text) {
    statusBadge.className = "status-badge" + (state === "sorting" ? " sorting" : "");
    statusBadge.innerHTML = '<span class="status-dot"></span>' + text;
}

inp_gen.addEventListener("click", generate_array);
inp_as.addEventListener("input", update_array_size);
inp_aspeed.addEventListener("input", updateSpeedDisplay);

function generate_array() {
    cont.innerHTML = "";

    for (var i = 0; i < array_size; i++) {
        div_sizes[i] = Math.floor(Math.random() * 0.5 * (inp_as.max - inp_as.min)) + 10;
        divs[i] = document.createElement("div");
        divs[i].className = "bar bar-default";
        cont.appendChild(divs[i]);
        margin_size = 0.1;
        divs[i].style = "margin:0% " + margin_size + "%; width:" + (100 / array_size - (2 * margin_size)) + "%; height:" + (div_sizes[i]) + "%;";
    }
}

function update_array_size() {
    array_size = inp_as.value;
    updateSizeDisplay();
    generate_array();
}

window.onload = function () {
    updateSizeDisplay();
    updateSpeedDisplay();
    update_array_size();
};

for (var i = 0; i < butts_algos.length; i++) {
    butts_algos[i].addEventListener("click", runalgo);
}

function disable_buttons() {
    for (var i = 0; i < butts_algos.length; i++) {
        butts_algos[i].classList = [];
        butts_algos[i].classList.add("butt_locked");
        butts_algos[i].disabled = true;
        inp_as.disabled = true;
        inp_gen.disabled = true;
        inp_aspeed.disabled = true;
    }
    setStatus("sorting", "Sorting...");
}

function runalgo() {
    disable_buttons();

    this.classList.add("butt_selected");
    var algo = this.getAttribute("data-algo");
    topbarHint.textContent = "Running " + this.textContent.trim() + "...";

    switch (algo) {
        case "Bubble": Bubble(); break;
        case "Selection": Selection_sort(); break;
        case "Insertion": Insertion(); break;
        case "Merge": Merge(); break;
        case "Quick": Quick(); break;
        case "Heap": Heap(); break;
    }
}
