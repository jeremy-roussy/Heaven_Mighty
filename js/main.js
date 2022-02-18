import { createJet } from './jet.js';

let canvas;
let engine;
let scene;
let camera;

window.onload = startGame;

function startGame() {
    console.log("startGame");
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);

    scene = createScene();

    modifySettings();

    // main animation loop 60 times/s
    scene.toRender = () => {
        let deltaTime = engine.getDeltaTime();

        let jet = scene.getMeshByName("jet");

        // second parameter is the target to follow
        scene.followCameraJet = createFollowCamera(scene, jet);
        scene.activeCamera = scene.followCameraJet;

        jet.move();
        jet.messageAlert();

        scene.render();
    };

    // instead of running the game, we tell instead the asset manager to load.
    // when finished it will execute its onFinish callback that will run the loop
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.assetsManager = configureAssetManager(scene);

    let dome = new BABYLON.PhotoDome(
        "skydome",
        "./environment/sky2.jpg",
        {
            resolution: 64,
            size: 10000
        },
        scene
    );
    
    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map2.jpg", {width:10000, height:10000, subdivisions: 250, minHeight:0, maxHeight: 2500});
    //const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map4.png", {width:10000, height:10000, subdivisions: 1000, minHeight:0, maxHeight: 3000});
    // const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map3.png", {width:10000, height:10000, subdivisions: 750, minHeight:0, maxHeight: 3000});

    createJet(scene);

    createLights(scene);

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

    var binaryTask = assetsManager.addBinaryFileTask("gunSound", "sounds/bullet.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.gunSound = new BABYLON.Sound("gun", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("rocketSound", "sounds/rocket.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.rocketSound = new BABYLON.Sound("rocket", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("flareSound", "sounds/flare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.flareSound = new BABYLON.Sound("flare", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("missileAlertSound", "sounds/missile-alert.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.missileAlertSound = new BABYLON.Sound("missileAlert", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("pullUpAlertSound", "sounds/VWS/pull-up.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.pullUpAlertSound = new BABYLON.Sound("pullUpAlert", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("chaffsFlareAlertSound", "sounds/VWS/chaffs-flare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.chaffsFlareAlertSound = new BABYLON.Sound("chaffsFlareAlert", task.data, scene, null, {
        loop: false,
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("skyCrawlers", "./sounds/friendly-duel.mp3");
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
}

function createFollowCamera(scene, target) {
    let targetName = target.name;

    // use the target name to name the camera
    let camera = new BABYLON.FollowCamera(
        targetName + "FollowCamera",
        new BABYLON.Vector3(target.position.x + 10, target.position.y, target.position.z),
        scene,
        target
    );

    // default values
    camera.radius = 0; // how far from the object to follow
    camera.heightOffset = 25; // how high above the object to place the camera
    camera.rotationOffset = 0; // the viewing angle
    camera.cameraAcceleration = 0.1; // how fast to move
    camera.maxCameraSpeed = 10; // speed limit

    return camera;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight(
        "dir0",
        new BABYLON.Vector3(-1, -1, 0),
        scene
    );
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
    scene.inputStates.space = false;
    scene.inputStates.shift = false;

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
            } else if(event.code === "Space") {
                scene.inputStates.space = true;
            } else if (event.code === "ShiftLeft") {
                scene.inputStates.shift = true;
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
            } else if(event.code === "Space") {
                scene.inputStates.space = false;
            } else if (event.code === "ShiftLeft") {
                scene.inputStates.shift = false;
            }
        },
        false
    );
}