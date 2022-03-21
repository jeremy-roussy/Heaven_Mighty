export function createCustomLoadingScreen(engine) {
    var loadingScreenDiv = window.document.getElementById("loadingScreen");

    function customLoadingScreen() {
        console.log("customLoadingScreen creation")
    }

    customLoadingScreen.prototype.displayLoadingUI = function () {
        
    };

    customLoadingScreen.prototype.hideLoadingUI = function () {
        loadingScreenDiv.style.display = "none";
    };

    var loadingScreen = new customLoadingScreen();
    engine.loadingScreen = loadingScreen;

    engine.displayLoadingUI();
}