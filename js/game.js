import { createJet } from './jet.js';
import { missileStatus } from './missile.js';
import { createAIM_120 } from './missile.js';
import { createAIM_9 } from './missile.js';
import { createAGM } from './missile.js';
import { createEnvironment } from './environment.js';
import { createCustomLoadingScreen } from './loadingScreen.js';

let canvas;
let engine;
let scene;

window.onload = startGame;

function startGame() {
    console.log("startGame");
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
        
        let leftAGM = scene.getMeshByName("leftAGM");
        let rightAGM = scene.getMeshByName("rightAGM");

        if(first) {
            jet.addChild(leftAIM_120);
            jet.addChild(rightAIM_120);
            jet.addChild(leftAIM_9);
            jet.addChild(rightAIM_9);
            jet.addChild(leftAGM);
            jet.addChild(rightAGM);

            first = false;
        }

        // second parameter is the target to follow
        scene.followCameraJet = createFollowCamera(scene, jet);
        scene.activeCamera = scene.followCameraJet;

        if (!scene.inputStates.p) {
            missileStatus(scene, leftAIM_120);
            missileStatus(scene, rightAIM_120);
            missileStatus(scene, leftAIM_9);
            missileStatus(scene, rightAIM_9);
            missileStatus(scene, leftAGM);
            missileStatus(scene, rightAGM);
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

    createAIM_120(scene, "leftAIM_120", new BABYLON.Vector3(0.75, 2500, -4.87));
    createAIM_120(scene, "rightAIM_120", new BABYLON.Vector3(0.75, 2500, 4.87));

    createAIM_9(scene, "leftAIM_9", new BABYLON.Vector3(0.8, 2499.65, -4));
    createAIM_9(scene, "rightAIM_9", new BABYLON.Vector3(0.8, 2499.65, 4));
    
    createAGM(scene, "leftAGM", new BABYLON.Vector3(0.6, 2499.6, -3.05));
    createAGM(scene, "rightAGM", new BABYLON.Vector3(0.6, 2499.6, 3.05));

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

function loadSounds(scene) {
    var assetsManager = scene.assetsManager;

    var binaryTask = assetsManager.addBinaryFileTask("gunSound", "./assets/sounds/bullet.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.gunSound = new BABYLON.Sound("gun", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("rocketSound", "./assets/sounds/rocket.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.rocketSound = new BABYLON.Sound("rocket", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("flareSound", "./assets/sounds/multipleFlare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.flareSound = new BABYLON.Sound("flare", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("missileAlertSound", "./assets/sounds/missile-alert.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.missileAlertSound = new BABYLON.Sound("missileAlert", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("pullUpAlertSound", "./assets/sounds/VWS/pull-up.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.pullUpAlertSound = new BABYLON.Sound("pullUpAlert", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("chaffsFlareAlertSound", "./assets/sounds/VWS/chaffs-flare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.chaffsFlareAlertSound = new BABYLON.Sound("chaffsFlareAlert", task.data, scene, null, {
            loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("skyCrawlers", "./assets/sounds/friendly-duel.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.skyCrawlersMusic = new BABYLON.Sound(
            "skyCrawlers",
            task.data,
            scene,
            null,
            {
                loop: true,
                autoplay: true,
            }
        ).setVolume(0.25);
    };

    binaryTask = assetsManager.addBinaryFileTask("explosion", "./assets/sounds/explosion.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.explosion = new BABYLON.Sound(
            "explosion",
            task.data,
            scene,
            null,
            { loop: false, spatialSound: true }
        );
    };
}

function createFollowCamera(scene, target) {
    let targetName = target.name;

    // use the target name to name the camera
    let camera = new BABYLON.FollowCamera(
        targetName + "FollowCamera",
        new BABYLON.Vector3(target.position.x + 25, target.position.y, target.position.z),
        scene,
        target
    );

    // default values
    camera.radius = 0; // how far from the object to follow
    camera.heightOffset = 25; // how high above the object to place the camera
    camera.rotationOffset = 0; // the viewing angle
    camera.cameraAcceleration = 0.1; // how fast to move
    camera.maxCameraSpeed = 20; // speed limit
    camera.noRotationConstraint = false;

    return camera;
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

    document.getElementById("retour").addEventListener("click", (event) => {
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