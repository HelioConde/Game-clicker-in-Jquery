var timer;
var contador = 0;
var dinheiro = localStorage.getItem("dinheiro");
var dps = localStorage.getItem("dps");
var arma1C = localStorage.getItem("arma1");
var arma1 = 25 + 20 * arma1C;
var arma2C = localStorage.getItem("arma2");
var arma2 = 50 + 50 * parseFloat(arma2C);
var arma3C = localStorage.getItem("arma3");
var arma3 = 100 + 100 * parseFloat(arma3C);
var arma4C = localStorage.getItem("arma4");
var arma4 = 200 + 100 * parseFloat(arma4C);
var arma5C = localStorage.getItem("arma5");
var arma5 = 400 + 150 * parseFloat(arma5C);
var arma6C = localStorage.getItem("arma6");
var arma6 = 600 + 200 * parseFloat(arma6C);
var arma7C = localStorage.getItem("arma7");
var arma7 = 800 + 250 * parseFloat(arma7C);
var arma8C = localStorage.getItem("arma8");
var arma8 = 1000 + 300 * parseFloat(arma8C);
var arma9C = localStorage.getItem("arma9");
var arma9 = 1200 + 350 * parseFloat(arma9C);
var arma10C = localStorage.getItem("arma10");
var arma10 = 1400 + 400 * parseFloat(arma10C);

if (localStorage.getItem("efetioSom") == null) {
    localStorage.setItem("efetioSom", "on")
}

if (localStorage.getItem("dps") == null) {
    localStorage.setItem("dps", 0);
    dps = localStorage.getItem("dps");
}
if (localStorage.getItem("dinheiro") == null) {
    localStorage.setItem("dinheiro", 0);
    dinheiro = localStorage.getItem("dinheiro");
}
if (localStorage.getItem("arma1") == null) {
    localStorage.setItem("arma1", 0)
    arma1C = localStorage.getItem("arma1");
    var arma1 = 25 + 20 * arma1C;
    $("#item1").html("<img src='img/arma1.png'>Stone <div id='preco'>" + arma1 + "</div>")
}
if (localStorage.getItem("arma2") == null) {
    localStorage.setItem("arma2", 0)
    arma2C = localStorage.getItem("arma2");
    var arma2 = 50 + 50 * parseFloat(arma2C);
    $("#item2").html("<img src='img/arma2.png'>Blade <div id='preco'>" + arma2 + "</div>")
}
if (localStorage.getItem("arma3") == null) {
    localStorage.setItem("arma3", 0)
    arma3C = localStorage.getItem("arma3");
    var arma3 = 100 + 100 * parseFloat(arma3C);
    $("#item3").html("<img src='img/arma3.png'>Sword <div id='preco'>" + arma3 + "</div>")
}
if (localStorage.getItem("arma4") == null) {
    localStorage.setItem("arma4", 0)
    arma4C = localStorage.getItem("arma4");
    var arma4 = 200 + 100 * parseFloat(arma4C);
    $("#item4").html("<img src='img/arma4.png'>Sword Iron <div id='preco'>" + arma4 + "</div>")
}
if (localStorage.getItem("arma5") == null) {
    localStorage.setItem("arma5", 0)
    arma5C = localStorage.getItem("arma5");
    var arma5 = 400 + 150 * parseFloat(arma5C);
    $("#item5").html("<img src='img/arma5.png'>Sword Fire <div id='preco'>" + arma5 + "</div>")
}
if (localStorage.getItem("arma6") == null) {
    localStorage.setItem("arma6", 0)
    arma6C = localStorage.getItem("arma6");
    var arma6 = 600 + 200 * parseFloat(arma6C);
    $("#item6").html("<img src='img/arma6.png'>Razor Sword <div id='preco'>" + arma6 + "</div>")
}
if (localStorage.getItem("arma7") == null) {
    localStorage.setItem("arma7", 0)
    arma7C = localStorage.getItem("arma7");
    var arma7 = 800 + 250 * parseFloat(arma7C);
    $("#item7").html("<img src='img/arma7.png'>Ruins Sword <div id='preco'>" + arma7 + "</div>")
}
if (localStorage.getItem("arma8") == null) {
    localStorage.setItem("arma8", 0)
    arma8C = localStorage.getItem("arma8");
    var arma8 = 1000 + 300 * parseFloat(arma8C);
    $("#item8").html("<img src='img/arma8.png'>Fate Sword <div id='preco'>" + arma8 + "</div>")
}
if (localStorage.getItem("arma9") == null) {
    localStorage.setItem("arma9", 0)
    arma9C = localStorage.getItem("arma9");
    var arma9 = 1200 + 350 * parseFloat(arma9C);
    $("#item9").html("<img src='img/arma9.png'>Obsidian Sword <div id='preco'>" + arma9 + "</div>")
}
if (localStorage.getItem("arma10") == null) {
    localStorage.setItem("arma10", 0)
    arma10C = localStorage.getItem("arma10");
    var arma10 = 1400 + 400 * parseFloat(arma10C);
    $("#item10").html("<img src='img/arma10.png'>Ragnarok Sword <div id='preco'>" + arma10 + "</div>")
}
setTimeout(function itemC() {
    $("#item1").html("<img src='img/arma1.png'>Stone <div id='preco'>" + arma1 + "</div>")
    $("#item2").html("<img src='img/arma2.png'>Blade <div id='preco'>" + arma2 + "</div>")
    $("#item3").html("<img src='img/arma3.png'>Sword <div id='preco'>" + arma3 + "</div>")
    $("#item4").html("<img src='img/arma4.png'>Sword Iron <div id='preco'>" + arma4 + "</div>")
    $("#item5").html("<img src='img/arma5.png'>Sword Fire <div id='preco'>" + arma5 + "</div>")
    $("#item6").html("<img src='img/arma6.png'>Razor Sword <div id='preco'>" + arma6 + "</div>")
    $("#item7").html("<img src='img/arma7.png'>Ruins Sword <div id='preco'>" + arma7 + "</div>")
    $("#item8").html("<img src='img/arma8.png'>Fate Sword <div id='preco'>" + arma8 + "</div>")
    $("#item9").html("<img src='img/arma9.png'>Obsidian Sword <div id='preco'>" + arma9 + "</div>")
    $("#item10").html("<img src='img/arma10.png'>Ragnarok Sword <div id='preco'>" + arma10 + "</div>")
}, 1000)
$(".item").click(function () {
    if (localStorage.getItem("efetioSom") == "on") {
        document.getElementById("dinheiroSom").play()
    } else {

    }
})
function sondTrack() {
    if (localStorage.getItem("efetioSom") == "on") {
        setTimeout(function ataque() {
            document.getElementById("espada").play()
        }, 500)
    } else {

    }
}
$("#item1").click(function () {
    if (dinheiro >= arma1) {
        console.log(arma1)
        arma1C++;
        dinheiro = parseFloat(dinheiro) - parseFloat(arma1)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma1", arma1C)
        arma1C = localStorage.getItem("arma1");
        arma1 = 25 + 20 * arma1C;
        $("#item1").html("<img src='img/arma1.png'>Stone <div id='preco'>" + arma1 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log(arma1)
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item2").click(function () {
    if (dinheiro >= arma2) {
        console.log(arma2)
        arma2C = parseFloat(arma2C) + parseFloat(2);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma2)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma2", arma2C)
        arma2C = localStorage.getItem("arma2");
        arma2 = 50 + 50 * parseFloat(arma2C);
        $("#item2").html("<img src='img/arma2.png'>Blade <div id='preco'>" + arma2 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log(arma2)
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item3").click(function () {
    if (dinheiro >= arma3) {
        console.log(arma3)
        arma3C = parseFloat(arma3C) + parseFloat(3);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma3)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma3", arma3C)
        arma3C = localStorage.getItem("arma3");
        arma3 = 100 + 100 * parseFloat(arma3C);
        $("#item3").html("<img src='img/arma3.png'>Sword <div id='preco'>" + arma3 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")

    } else {
        console.log(arma3)
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item4").click(function () {
    if (dinheiro >= arma4) {
        console.log(arma4)
        arma4C = parseFloat(arma4C) + parseFloat(4);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma4)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma4", arma4C)
        arma4C = localStorage.getItem("arma4");
        arma4 = 200 + 100 * parseFloat(arma4C);
        $("#item4").html("<img src='img/arma4.png'>Sword Iron <div id='preco'>" + arma4 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")

    } else {
        console.log(arma4)
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item5").click(function () {
    if (dinheiro >= arma5) {
        dps++;
        localStorage.setItem("dps", dps)
        arma5C = parseFloat(arma5C) + parseFloat(5);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma5)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma5", arma5C)
        arma5C = localStorage.getItem("arma5");
        arma5 = 400 + 200 * parseFloat(arma5C);
        $("#item5").html("<img src='img/arma5.png'>Sword Fire <div id='preco'>" + arma5 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item6").click(function () {
    if (dinheiro >= arma6) {
        arma6C = parseFloat(arma6C) + parseFloat(6);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma6)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma6", arma6C)
        arma6C = localStorage.getItem("arma6");
        arma6 = 600 + 200 * parseFloat(arma6C);
        $("#item6").html("<img src='img/arma6.png'>Razor Sword <div id='preco'>" + arma6 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item7").click(function () {
    if (dinheiro >= arma7) {
        arma7C = parseFloat(arma7C) + parseFloat(7);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma7)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma7", arma7C)
        arma7C = localStorage.getItem("arma7");
        arma7 = 800 + 250 * parseFloat(arma7C);
        $("#item7").html("<img src='img/arma7.png'>Ruins Sword <div id='preco'>" + arma7 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item8").click(function () {
    if (dinheiro >= arma8) {
        arma8C = parseFloat(arma8C) + parseFloat(8);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma8)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma8", arma8C)
        arma8C = localStorage.getItem("arma8");
        arma8 = 1000 + 300 * parseFloat(arma8C);
        $("#item8").html("<img src='img/arma8.png'>Fate Sword <div id='preco'>" + arma8 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item9").click(function () {
    if (dinheiro >= arma9) {
        arma9C = parseFloat(arma9C) + parseFloat(9);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma9)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma9", arma9C)
        arma9C = localStorage.getItem("arma9");
        arma9 = 1200 + 350 * parseFloat(arma9C);
        $("#item9").html("<img src='img/arma9.png'>Obsidian Sword <div id='preco'>" + arma9 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
$("#item10").click(function () {
    if (dinheiro >= arma10) {
        dps++;
        dps++;
        localStorage.setItem("dps", dps)
        arma10C = parseFloat(arma10C) + parseFloat(10);
        dinheiro = parseFloat(dinheiro) - parseFloat(arma10)
        localStorage.setItem("dinheiro", dinheiro);
        dinheiro = localStorage.getItem("dinheiro");
        localStorage.setItem("arma10", arma10C)
        arma10C = localStorage.getItem("arma10");
        arma10 = 1400 + 400 * parseFloat(arma10C);
        $("#item10").html("<img src='img/arma10.png'>Ragnarok Sword <div id='preco'>" + arma10 + "</div>")
        $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    } else {
        console.log("falta dinheiro")
        document.getElementById("erro").play()
    }
})
setInterval(function shoopping() {
    color()
}, 500)
setInterval(function itemC() {
    color()
    if (dps >= 1) {
        money()
    }
    dinheiro = parseFloat(dinheiro) + parseFloat(dps);
    localStorage.setItem("dinheiro", dinheiro);
    dinheiro = localStorage.getItem("dinheiro");
    $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
}, 1000)
$("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
function clicker() {
    color()
    dinheiro++;
    dinheiro = parseFloat(dinheiro) + parseFloat(arma1C) + parseFloat(arma2C) + parseFloat(arma3C) + parseFloat(arma4C);
    localStorage.setItem("dinheiro", dinheiro);
    dinheiro = localStorage.getItem("dinheiro");
    sondTrack()

    $("#valor").html("<ul><li><img src='img/money.gif'></li><li>" + dinheiro + "</li></ul>")
    money()
    $("#personagem").html('<img src="img/attack.gif" alt="">')
    $("#enimei").html('<img src="img/monstro_dano.png">')
    $("#gameCenter").onclick = null
    var redButton = document.getElementById("personagem");
    if (redButton.removeEventListener) {    // all browsers except IE before version 9
        redButton.removeEventListener("click", clicker, false);
    }
    else {
        if (redButton.detachEvent) {        // IE before version 9
            redButton.detachEvent('onclick', clicker);
        }
    }
    ativo = false;
    function desabilitar(e) {
        e.stopPropagation();
        e.preventDefault();

    }
    if (ativo === false) {
        document.addEventListener("click", desabilitar, true);
    }

    ativo = true;

    setTimeout(function () { document.removeEventListener("click", desabilitar, true); }, 500);


    tempo()
}
tempo()

function tempo() {
    timer = window.setTimeout(function () {
        $("#personagem").html('<img src="img/stop.png" alt="">')
        $("#enimei").html('<img src="img/monstro.gif">')
        var redButton = document.getElementById("gameCenter");
        if (redButton.addEventListener) {   // all browsers except IE before version 9
            redButton.addEventListener("click", clicker, false);
        }
        else {
            if (redButton.attachEvent) {    // IE before version 9
                redButton.attachEvent('onclick', clicker);
            }
        }
    }, 500)
}
function money() {
    contador++;
    var id = "monei" + contador
    $("#dinheiro").append('<span id="' + id + '"><img src="img/money.gif" alt=""></span>')
    animate()
}
function animate() {
    var animationMoneyX = Math.floor(Math.random() * 40)
    var id = "monei" + contador
    $("#" + id).css({
        "position": "fixed",
        "margin-left": animationMoneyX + "%"
    })
    $("#" + id).animate({ top: "+=0" }, 0);
    $("#" + id).animate({
        top: "+=587",
        opacity: "-1",
    }, 5000);

    if (contador >= 100) {
        contador = 0
        $("#dinheiro").html("")
    }
}
function color() {
    if (dinheiro >= arma1) {
        $("#item1").css({
            "background": "#0080004e"
        })
    } else {
        $("#item1").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma2) {
        $("#item2").css({
            "background": "#0080004e"
        })
    } else {
        $("#item2").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma3) {
        $("#item3").css({
            "background": "#0080004e"
        })
    } else {
        $("#item3").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma4) {
        $("#item4").css({
            "background": "#0080004e"
        })
    } else {
        $("#item4").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma5) {
        $("#item5").css({
            "background": "#0080004e"
        })
    } else {
        $("#item5").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma6) {
        $("#item6").css({
            "background": "#0080004e"
        })
    } else {
        $("#item6").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma7) {
        $("#item7").css({
            "background": "#0080004e"
        })
    } else {
        $("#item7").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma8) {
        $("#item8").css({
            "background": "#0080004e"
        })
    } else {
        $("#item8").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma9) {
        $("#item9").css({
            "background": "#0080004e"
        })
    } else {
        $("#item9").css({
            "background": "#ff00005d"
        })
    }
    if (dinheiro >= arma10) {
        $("#item10").css({
            "background": "#0080004e"
        })
    } else {
        $("#item10").css({
            "background": "#ff00005d"
        })
    }
}
var loja = "off";
$("#loja").click(function () {
    if (loja == "off") {
        $("#lojaOpen").append('<div id="menuLoja"><div>')
        $("#menuLoja").html('<img src="img/stop.png">')
        loja = "on"
    } else {
        loja = "off"
        $("#lojaOpen").html("")
    }
})
var config = "off"
var somE = localStorage.getItem("efetioSom")
$("#config").click(function () {
    if (config == "off") {
        $("#configOpen").append('<div id="configLoja"><div>')
        $("#configLoja").html('<div id="efeito">Efeito Sonoro = ' + somE + '</div>')
        config = "on"
        $("#efeito").click(function () {
            if (localStorage.getItem("efetioSom") == "on") {
                localStorage.setItem("efetioSom", "off")
                somE = localStorage.getItem("efetioSom")
                $("#efeito").html('Efeito Sonoro = ' + somE)
            } else {
                localStorage.setItem("efetioSom", "on")
                somE = localStorage.getItem("efetioSom")
                $("#efeito").html('Efeito Sonoro = ' + somE)
            }
        })
    } else {
        config = "off"
        $("#configOpen").html("")
    }
})