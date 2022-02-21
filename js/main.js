import { createJet } from './jet.js';

let canvas;
let engine;
let scene;
let camera;

window.onload = startGame;

function startGame() {
    console.log("startGame");
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true, { stencil: true });

    scene = createScene();

    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());

    modifySettings();

    // main animation loop 60 times/s
    scene.toRender = () => {
        let deltaTime = engine.getDeltaTime();

        let jet = scene.getMeshByName("jet");

        // second parameter is the target to follow
        scene.followCameraJet = createFollowCamera(scene, jet);
        scene.activeCamera = scene.followCameraJet;

        //update position of camera
        //scene.activeCamera.position = jet.position.TransformCoordinates(jet.frontVector, )

        jet.move();
        jet.verifyAltitude();
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

    createGround(scene);
    createSky(scene);

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

function createSky(scene) {
    let dome = new BABYLON.PhotoDome(
        "skydome",
        "./environment/sky2.jpg",
        {
            resolution: 64,
            size: 10000
        },
        scene
    );
}

function createGround(scene) {
    const groundOptions = {
        width: 10000,
        height: 10000,
        subdivisions: 250,
        minHeight: 0,
        maxHeight: 2500,
        onReady: onGroundCreated,
    };

    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "./environment/map2.jpg",
        groundOptions,
        scene
    );

    // const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map4.png", {width:10000, height:10000, subdivisions: 1000, minHeight:0, maxHeight: 3000});
    // const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map3.png", {width:10000, height:10000, subdivisions: 750, minHeight:0, maxHeight: 3000});

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("./environment/rock3.jpg");
        ground.material = groundMaterial;

        // to be taken into account by collision detection
        ground.checkCollisions = true;

        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0 },
            scene
        );
    }
    return ground;
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

    binaryTask = assetsManager.addBinaryFileTask("flareSound", "sounds/multipleFlare.mp3");
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
        ).setVolume(0.25); // set to 0.25 if you want to play
    };

    binaryTask = assetsManager.addBinaryFileTask("explosion", "sounds/explosion.mp3");
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
}