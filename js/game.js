import { createJet } from './jet.js';
import { createFuelTank } from './fuelTank.js';
import { createMissile } from './missile.js';
import { missileStatus } from './missile.js';
import { createEnvironment } from './environment.js';
import { createCustomLoadingScreen } from './loadingScreen.js';
import { loadSounds } from './sound.js';
import { soundVolume } from './sound.js';
import { createFollowCamera } from "./camera.js";

let canvas;
let engine;
let scene;

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true, { stencil: true });

    let first = true;

    createCustomLoadingScreen(engine);

    scene = createScene();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());

    modifySettings();

    // main animation loop 60 times/s
    scene.toRender = () => {
        document.getElementById("fps").innerHTML = engine.getFps().toFixed() + " fps";

        let jet = scene.getMeshByName("jet");

        let leftAIM_120 = scene.getMeshByName("leftAIM_120");
        let rightAIM_120 = scene.getMeshByName("rightAIM_120");

        let leftAIM_9 = scene.getMeshByName("leftAIM_9");
        let rightAIM_9 = scene.getMeshByName("rightAIM_9");
        
        let leftAGM_88 = scene.getMeshByName("leftAGM_88");
        let rightAGM_88 = scene.getMeshByName("rightAGM_88");

        let leftFuelTank = scene.getMeshByName("leftFuelTank");
        let rightFuelTank = scene.getMeshByName("rightFuelTank");

        if(first) {
            jet.addChild(leftAIM_120);
            jet.addChild(rightAIM_120);
            jet.addChild(leftAIM_9);
            jet.addChild(rightAIM_9);
            jet.addChild(leftAGM_88);
            jet.addChild(rightAGM_88);
            jet.addChild(leftFuelTank);
            jet.addChild(rightFuelTank);

            // second parameter is the target to follow
            scene.followCameraJet = createFollowCamera(scene, jet);
            scene.activeCamera = scene.followCameraJet;

            first = false;
        }

        soundVolume(scene);

        if (!scene.inputStates.p) {
            missileStatus(scene, leftAIM_120);
            missileStatus(scene, rightAIM_120);
            missileStatus(scene, leftAIM_9);
            missileStatus(scene, rightAIM_9);
            missileStatus(scene, leftAGM_88);
            missileStatus(scene, rightAGM_88);
            jet.move();
            jet.verifyAltitude();
            jet.verifyLatitude();
            jet.messageAlert();
            document.getElementById("pause").style.display = "none";
        } else {
            document.getElementById("pause").style.display = "flex";
        }

        scene.render();
    };

    // instead of running the game, we tell instead the asset manager to load.
    // when finished it will execute its onFinish callback that will run the loop
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.musicVolume = 0.5;
    scene.effectsVolume = 0.5;

    scene.assetsManager = configureAssetManager(scene);

    createEnvironment(scene);

    createJet(scene);

    createMissile(scene, "AIM_120", "left", new BABYLON.Vector3(0.75, 1500, -4.87));
    createMissile(scene, "AIM_120", "right", new BABYLON.Vector3(0.75, 1500, 4.87));

    createMissile(scene, "AIM_9", "left", new BABYLON.Vector3(0.8, 1499.65, -4));
    createMissile(scene, "AIM_9", "right", new BABYLON.Vector3(0.8, 1499.65, 4));
    
    createMissile(scene, "AGM_88", "left", new BABYLON.Vector3(0.6, 1499.6, -3.05));
    createMissile(scene, "AGM_88", "right", new BABYLON.Vector3(0.6, 1499.6, 3.05));

    createFuelTank(scene, "leftFuelTank", new BABYLON.Vector3(-0.5, 1499.4, -1.85));
    createFuelTank(scene, "rightFuelTank", new BABYLON.Vector3(-0.5, 1499.4, 1.85));

    loadSounds(scene);

    return scene;
}

function configureAssetManager(scene) {
    // useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
    scene.assets = {};

    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onProgress = function (
        remainingCount,
        totalCount,
        lastFinishedTask
    ) {
        engine.loadingUIText =
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded.";
        console.log(
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded."
        );
    };

    assetsManager.onFinish = function (tasks) {
        engine.runRenderLoop(function () {
            scene.toRender();
        });
    };

    return assetsManager;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {

    // key listeners for the jet
    scene.inputStates = {};
    scene.inputStates.left = false;
    scene.inputStates.right = false;
    scene.inputStates.up = false;
    scene.inputStates.down = false;
    scene.inputStates.strafeL = false;
    scene.inputStates.strafeR = false;
    scene.inputStates.f = false;
    scene.inputStates.p = false;
    scene.inputStates.space = false;
    scene.inputStates.shift = false;
    scene.inputStates.arrowUp = false;
    scene.inputStates.arrowDown = false;

    //add the listener to the main, window object, and update the states
    window.addEventListener(
        "keydown",
        (event) => {
            if (event.code === "KeyA") {
                scene.inputStates.left = true;
            } else if (event.code === "KeyW") {
                scene.inputStates.up = true;
            } else if (event.code === "KeyD") {
                scene.inputStates.right = true;
            } else if (event.code === "KeyS") {
                scene.inputStates.down = true;
            } else if (event.code === "KeyQ") {
                scene.inputStates.strafeL = true;
            } else if (event.code === "KeyE") {
                scene.inputStates.strafeR = true;
            } else if (event.code === "KeyF") {
                scene.inputStates.f = true;
            } else if (event.code === "KeyP") {
                scene.inputStates.p = !scene.inputStates.p;
            } else if (event.code === "Space") {
                scene.inputStates.space = true;
            } else if (event.code === "ShiftLeft") {
                scene.inputStates.shift = true;
            } else if (event.code === "ArrowUp") {
                scene.inputStates.arrowUp = true;
            } else if (event.code === "ArrowDown") {
                scene.inputStates.arrowDown = true;
            }
        },
        false
    );

    //if the key will be released, change the states object
    window.addEventListener(
        "keyup",
        (event) => {
            if (event.code === "KeyA") {
                scene.inputStates.left = false;
            } else if (event.code === "KeyW") {
                scene.inputStates.up = false;
            } else if (event.code === "KeyD") {
                scene.inputStates.right = false;
            } else if (event.code === "KeyS") {
                scene.inputStates.down = false;
            } else if (event.code === "KeyQ") {
                scene.inputStates.strafeL = false;
            } else if (event.code === "KeyE") {
                scene.inputStates.strafeR = false;
            } else if (event.code === "KeyF") {
                scene.inputStates.f = false;
            } else if (event.code === "Space") {
                scene.inputStates.space = false;
            } else if (event.code === "ShiftLeft") {
                scene.inputStates.shift = false;
            } else if (event.code === "ArrowUp") {
                scene.inputStates.arrowUp = false;
            } else if (event.code === "ArrowDown") {
                scene.inputStates.arrowDown = false;
            }
        },
        false
    );

    document.getElementById("resume-btn").addEventListener("click", (event) => {
        scene.inputStates.p = false;
    });

    document.getElementById("settings-btn").addEventListener("click", (event) => {
        document.getElementById("choices").style.display = "none";
        document.getElementById("settings").style.display = "flex";
    });

    document.getElementById("cancel").addEventListener("click", (event) => {
        document.getElementById("settings").style.display = "none";
        document.getElementById("choices").style.display = "flex";
    });

    document.getElementById("effects-slide").oninput = () => {
        let effects_volume = document.getElementById("effects-slide").value;
        document.getElementById("effects-slide-value").innerText = effects_volume + " %";

        scene.effectsVolume = effects_volume / 100;
    };

    document.getElementById("music-slide").oninput = () => {
        let music_volume = document.getElementById("music-slide").value;
        document.getElementById("music-slide-value").innerText = music_volume + " %";

        scene.musicVolume = music_volume / 100;
    };
}