(()=>{

function boardInit() {
    s = "";
    for (let i = 3; i >= 0; i--) {
        s += "<tr><th>" + n[7 * i] + "</th>";
        for (let j = 1; j < 12; j++) {
            s += "<td>" + n[7 * i + j] + "</td>";
        }
        s += "</tr>"
    }
    s = "<tbody>" + s + "</tbody>";
    table.innerHTML = s;
}

function buttonInit() {
    document.getElementById("search").addEventListener("click", main);
    document.getElementById("a").addEventListener("click", () => {
        if (kouho > 0) { kouho-- } else { kouho = res.length - 1 }
        unshi = 0;
        disp(res[kouho][0][unshi], notes[unshi]);
        scoreUpdate();
    });
    document.getElementById("b").addEventListener("click", () => {
        if (unshi > 0) { unshi-- } else { unshi = notes.length - 1 }
        disp(res[kouho][0][unshi], notes[unshi]);
        scoreUpdate();
    });
    document.getElementById("c").addEventListener("click", () => {
        if (unshi < notes.length - 1) { unshi++ } else { unshi = 0 }
        disp(res[kouho][0][unshi], notes[unshi]);
        scoreUpdate();
    });
    document.getElementById("d").addEventListener("click", () => {
        if (kouho < res.length - 1) { kouho++ } else { kouho = 0 }
        unshi = 0;
        disp(res[kouho][0][unshi], notes[unshi]);
        scoreUpdate();
    });
}

function scoreUpdate() {
    document.getElementById("pr").innerHTML = `候補：${kouho + 1}/${res.length}　運指：${unshi + 1}/${notes.length}　スコア：${Math.round(res[kouho][1] * 100) / 100}`
}

function importNotes() {
    notes = document.getElementById("inotes").value.match(/\d+/g).map(e=>Number(e));
    document.getElementById("onotes").innerHTML = document.getElementById("inotes").value.trim().split("\n").map(e=>e.match(/\d+/g).map(f=>n[f]).join(", ")).join("<br>");
}

function disp(d, noteid) {
    table.innerHTML = s;
    const posy = d >> 3 & 15;
    table.children[0].children[3 - (d >> 14)].children[posy - 1 - (d >> 7 & 1)] .setAttribute("class", "fin");
    table.children[0].children[3 - (d >> 12 & 3)].children[posy].setAttribute("class", "fin");
    table.children[0].children[3 - (d >> 10 & 3)].children[posy + 1].setAttribute("class", "fin");
    table.children[0].children[3 - (d >> 8 & 3)].children[posy + 2].setAttribute("class", "fin");
    if (d & 4) {
        table.children[0].children[3 - noteid / 7].children[0].setAttribute("class", "oto");
    } else {
        table.children[0].children[3 - (d &3)].children[noteid - 7*(d &3)].setAttribute("class", "oto");
    }
}

function stopWorker() {
    worker.terminate();
    document.getElementById("pr2").innerHTML = "";
    changeButtonTo(1);
    console.timeEnd("timer");
}

function changeButtonTo(a) {
    if (a == 0) {
        document.getElementById("btn").innerHTML = '<button id="stop">中止</button>';
        document.getElementById("stop").addEventListener("click", stopWorker);
    } else {
        document.getElementById("btn").innerHTML = '<button id="search">探索</button>';
        document.getElementById("search").addEventListener("click", main);
    }
}

function main() {
    if (notes.some(e=>e<0||e>32)) {
        alert("音を正しく入力してください");
        return;
    }
    const beam_width = Math.floor(Number(document.getElementById("bw").value));
    if (beam_width<=0) {
        alert("ビーム幅は正の整数値にしてください");
        return;
    }
    const kakutyo = Number(document.getElementById("ex").value);
    const high = Number(document.getElementById("hp").value);
    const open_cost = Number(document.getElementById("op").value);
    const finger_distancde = Number(document.getElementById("fd").value);
    const move_distance = Number(document.getElementById("mv").value);
    const move_open = Number(document.getElementById("mo").value);
    const move_ealry = Number(document.getElementById("me").value);
    const move_count = Number(document.getElementById("mc").value);
    const move_string = Number(document.getElementById("ms").value);
    document.getElementById("pr2").innerHTML = "進捗：0%";
    changeButtonTo(0);
    worker = new Worker("js/search.js");
    console.time("timer");
    worker.addEventListener('message', e => {
        if ((typeof e.data) == "number") {
            document.getElementById("pr2").innerHTML = `進捗：${Math.round(10000 * (1 - e.data / notes.length)) / 100}%`
            return;
        }
        console.timeEnd("timer");
        changeButtonTo(1);
        document.getElementById("pr2").innerHTML = "";
        res = e.data;
        kouho = 0;
        unshi = 0;
        disp(res[0][0][0], notes[0]);
        scoreUpdate();
    }, false);
    importNotes();
    worker.postMessage({
        notes,
        divs,
        beam_width,
        kakutyo,
        high,
        open_cost,
        finger_distancde,
        move_distance,
        move_open,
        move_ealry,
        move_count,
        move_string
    });
}

let notes = [], divs = [];
let s = "";
let kouho = 0, unshi = 0;
let res = [];
let worker;
const table = document.getElementById("board");
const n = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"];

boardInit();
buttonInit();
importNotes();
document.getElementById("inotes").addEventListener("change", importNotes)
addEventListener("keyup", importNotes);

})();