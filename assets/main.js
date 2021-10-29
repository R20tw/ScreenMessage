//Menu
var options = {
    "color": "",
    "background": "",
    "modes": [],
};

var colors = [
    "rgb(255,0,0)",
    "rgb(255,127,0)",
    "rgb(255,255,0)",
    "rgb(127,255,0)",
    "rgb(0,255,0)",
    "rgb(0,255,127)",
    "rgb(0,255,255)",
    "rgb(0,127,255)",
    "rgb(0,0,255)",
    "rgb(127,0,255)",
    "rgb(255,0,255)",
    "rgb(255,0,127)"
]

var textarea = null;
var colorPicker = null;
var Intervals = {

};
var RainbowPositions = {

};

Array.prototype.remove = function() {
    var toDelete = arguments[0];
    if (this.indexOf(toDelete)) {
        this.splice(this.indexOf(toDelete), 1);
    }
    return this;
};

function isMobile() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}


// Rainbow Functions
function startRainbow(type) {
    var el = (type == "background") ? document.body : textarea;
    if (!(type in RainbowPositions)) {
        RainbowPositions[type] = 0;
    }
    Intervals[type + "rainbow"] = setInterval(() => {
        if ((RainbowPositions[type] + 1) == colors.length) {
            RainbowPositions[type] = -1
        }
        el.style[type] = colors[RainbowPositions[type]]
        RainbowPositions[type] += 1;
    }, 200)
}

function stopRainbow(type) {
    if ((type + "rainbow") in Intervals) {
        clearInterval(Intervals[type + "rainbow"])
    }
}


// Color
function setColor(type, color) {
    var el = (type == "background") ? document.body : textarea;
    stopRainbow(type);
    if (color == "custom") {
        colorPicker.click()
        colorPicker.onchange = () => {
            el.style[type] = colorPicker.value;
            options[type] = colorPicker.value;
            setHash();
        }
    } else if (color == "rainbow") {
        startRainbow(type)
    } else {
        el.style[type] = color;
    }
    options[type] = color;
    setHash();
}

function fontColor(fontColor) {
    setColor("color", fontColor)
}

function background(backgroundColor) {
    setColor("background", backgroundColor)
}

// Modes
function pulse() {
    if (options.modes.includes("pulse")) {
        clearInterval(Intervals["pulse"]);
        textarea.style.opacity = "";
        removeMode("pulse");
    } else {
        options.modes.push("pulse");
        var status = true;
        Intervals["pulse"] = setInterval(() => {
            if (status) {
                textarea.style.opacity = 0;
                status = false;
            } else {
                textarea.style.opacity = 1;
                status = true;
            }
        }, 400)
    }
    setHash();
}

function blink() {
    if (options.modes.includes("blink")) {
        clearInterval(Intervals["blink"]);
        textarea.style.display = "";
        removeMode("blink");
    } else {
        options.modes.push("blink");
        var status = true;
        Intervals["blink"] = setInterval(() => {
            if (status) {
                textarea.style.display = "none";
                status = false;
            } else {
                textarea.style.display = "";
                status = true;
            }
        }, 400)
    }
    setHash();
}

function removeMode(modeName) {
    if (options.modes.length == 1) {
        options.modes.remove(0);
    } else {
        options.modes.remove(modeName);
    }
}

function mode(modeName) {
    if (modeName == "pulse") {
        pulse()
    }
    if (modeName == "blink") {
        blink()
    }
}

// ScreenMessage
async function adjust() {
    await new Promise(_ => setTimeout(_,300));
    test = document.getElementById("test");

    test.textContent = textarea.value;
    test.innerHTML == (textarea.value[textarea.value.length - 1] == "\n") ? test.innerHTML + "." : test.innerHTML;

    ratioX = (window.innerWidth) / test.offsetWidth;
    ratioY = (window.innerHeight) / test.offsetHeight;
    ratio = Math.min(ratioX, ratioY);
    fontSize = Math.floor(30 * ratio) + "px"
    textarea.style.fontSize = fontSize;
    newHeight = Math.ceil(test.offsetHeight * ratio);
    textarea.style.paddingTop = Math.floor((window.innerHeight - newHeight) / 2) + "px";
    textarea.style.paddingBottom = Math.floor((window.innerHeight - newHeight) / 2) + "px";
    newWidth = Math.ceil(test.offsetWidth * ratio);
    textarea.style.paddingLeft = Math.max(0, Math.floor((window.innerWidth - newWidth) / 2)) + "px";
    textarea.style.paddingRight = Math.max(0, Math.floor((window.innerWidth - newWidth) / 2)) + "px";
    setHash();
}

// Hash Data Utils
function setHash() {
    href = "#text=" + encodeURIComponent(document.getElementById("textarea").value);
    if (options.color) { href += ";color=" + encodeURIComponent(options.color); }
    if (options.background) { href += ";background=" + encodeURIComponent(options.background); }
    if (options.modes) { href += ";modes=" + encodeURIComponent(options.modes.join(",")); }
    window.location.hash = href;
}

function getHashData() {
    var data = {};
    window.location.hash.split(";").forEach(item => data[item.split("=")[0]] = item.split("=")[1]);
    if ("#text" in data) {
        textarea.textContent = decodeURIComponent(data["#text"])
    }
    if ("color" in data) {
        fontColor(decodeURIComponent(data["color"]));
    }
    if ("background" in data) {
        background(decodeURIComponent(data["background"]));
    }
    if ("modes" in data) {
        decodeURIComponent(data["modes"]).split(",").forEach(modeName => {
            mode(modeName)
        })
    }
}

// Init
function init() {
    textarea = document.getElementById("textarea");
    colorPicker = document.getElementById("colorPicker");

    getHashData()

    if (isMobile()) {
        var touchStartX = 0;
        var touchEndX = 0;
        document.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        });
        document.addEventListener("touchmove", (e) => {
            touchEndX = e.touches[0].clientX;
        })
        document.addEventListener("touchend", (e) => {
            if (touchStartX <= touchEndX) {
                document.getElementById("sidepanel").style.left = "0";
            }
            if (touchStartX > touchEndX) {
                document.getElementById("sidepanel").style.left = "-18em";
            }
        });

    } else {
        document.addEventListener("mousemove", (e) => {
            if (e.pageX <= document.getElementById("sidepanel").offsetWidth) {
                document.getElementById("sidepanel").style.left = "0";
            }
            if (e.pageX > document.getElementById("sidepanel").offsetWidth) {
                document.getElementById("sidepanel").style.left = "-18em";
            }
        });
    }
    adjust();
}
