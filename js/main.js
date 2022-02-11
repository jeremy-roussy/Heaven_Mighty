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
       jet.move();

        scene.render();
    };

          // instead of running the game, we tell instead the asset manager to load.
    // when finished it will execute its onFinish callback that will run the loop
    scene.assetsManager.load();
}

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.assetsManager = configureAssetManager(scene);

    //const localAxes = new BABYLON.AxesViewer(scene, 5);

    /*
    let dome = new BABYLON.PhotoDome(
        "skydome",
        "./environment/sky2.jpg",
        {
            resolution: 32,
            size: 10000
        },
        scene
    );
    */

    createJet(scene);

    camera = new BABYLON.FreeCamera("myCamera", new BABYLON.Vector3(0, 5, -10), scene);
    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    //camera.rotation.y = 0.3;
    //camera.attachControl(canvas);

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
        console.log("##### ON FINISH ######")
        engine.runRenderLoop(function () {
            scene.toRender();
        });
    };

    return assetsManager;
}

function loadSounds(scene) {
    var assetsManager = scene.assetsManager;

    var binaryTask = assetsManager.addBinaryFileTask("skyCrawlers", "./sounds/friendly-duel.mp3");
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
        ).setVolume(0.1);
    };
}

function createFollowCamera(scene, target) {
    let targetName = target.name;

    // use the target name to name the camera
    let camera = new BABYLON.FollowCamera(
        targetName + "FollowCamera",
        target.position,
        scene,
        target
    );

    // default values
    camera.radius = 40; // how far from the object to follow
    camera.heightOffset = 14; // how high above the object to place the camera
    camera.rotationOffset = 0; // the viewing angle
    camera.cameraAcceleration = 0.1; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

function createJet(scene) {

    var meshTask = scene.assetsManager.addMeshTask("jet task", "", "./models/F22/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {
        console.log("je suis rentré dans createJet");
        onJetImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onError = function() {
        console.log("ERRORRRR");
    }

    function onJetImported(meshes, particles, skeletons) {
        console.log("je suis rentré dans onJetImported");
        console.log("fin onJetImported");
        let jet = meshes[0];
        console.log("fin onJetImported");
        jet.name = "jet";

        jet.scaling.scaleInPlace(0.1);
        //jet.scaling.scaleInPlace(0.75);

        jet.position.y = 0;
        //jet.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
        jet.speed = 1;
        jet.frontVector = new BABYLON.Vector3(0, 0, 1);

        jet.move = () => {

            if (scene.inputStates.up) {
                jet.position.z += 0.05;
            }
            if (scene.inputStates.down) {
                jet.position.z += 0.05;
            }
            if (scene.inputStates.left) {

            }
            if (scene.inputStates.right) {

            }
        }
        console.log("fin onJetImported");
    }
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
    scene.inputStates.space = false;
    scene.inputStates.laser = false;

    //add the listener to the main, window object, and update the states
    window.addEventListener(
        "keydown",
        (event) => {
            console.log(event.code)
            if (event.code === "KeyA") {
                scene.inputStates.left = true;
            } else if (event.code === "KeyW") {
                scene.inputStates.up = true;
            } else if (event.code === "KeyD") {
                scene.inputStates.right = true;
            } else if (event.code === "KeyS") {
                scene.inputStates.down = true;
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
            }
        },
        false
    );
}