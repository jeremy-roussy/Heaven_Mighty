export function createCustomLoadingScreen(engine) {
    var loadingScreenDiv = window.document.getElementById("loadingScreen");
    var lens = window.document.getElementById("lens");
    var hud = window.document.getElementById("hud");

    const delay = (n) => new Promise( r => setTimeout(r, n*1000));

    function customLoadingScreen() {
        console.log("customLoadingScreen creation");
    }

    customLoadingScreen.prototype.displayLoadingUI = function () {
        lens.classList.add("loading");
    };

    customLoadingScreen.prototype.hideLoadingUI = function () {
        setTimeout(function(){
            lens.classList.remove("loading");
        },500);
        setTimeout(function(){
            lens.classList.add("spin-out");
        },1000);
        setTimeout(function(){
            //loadingScreenDiv.style.animation = "vanish 0.5s linear";
            loadingScreenDiv.style.display = "none";
        },1500);
    };

    var loadingScreen = new customLoadingScreen();
    engine.loadingScreen = loadingScreen;

    engine.displayLoadingUI();
}