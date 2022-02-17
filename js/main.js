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
    // const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map4.png", {width:10000, height:10000, subdivisions: 1000, minHeight:0, maxHeight: 3000});
    // const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./environment/map3.png", {width:10000, height:10000, subdivisions: 750, minHeight:0, maxHeight: 3000});

    createJet(scene);

    createLights(scene);

    createGUI(scene);

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

function createGUI(scene) {
    
}

function createJet(scene) {

    var meshTask = scene.assetsManager.addMeshTask("jet task", "", "./models/F16/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onJetImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onJetImported(meshes, particles, skeletons) {
        let jet = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = jet;
        localAxes.yAxis.parent = jet;
        localAxes.zAxis.parent = jet;

        jet.name = "jet";

        jet.scaling.scaleInPlace(0.1);        
        
        jet.position.y = 2000;
        jet.speed = 10;
        jet.fireMode = "bullet";
        
        // to avoid firing too many lasers rapidly
        jet.gunAmmunition = 2400;
        jet.canFire = true;
        jet.fireAfter = 0.01; // in seconds

        // to avoid firing too many rockets rapidly
        jet.rocketAmmunition = 2;
        jet.canFireRockets = true;
        jet.fireRocketsAfter = 2; // in seconds

        jet.move = () => {

            let radian = Math.PI / 180;
            jet.frontVector = localAxes.xAxis.forward;

            /*
            jet.moveWithCollisions(
                jet.frontVector.multiplyByFloats(jet.speed, jet.speed, jet.speed)
            );
            */

            if (scene.inputStates.up) {
                jet.rotate(BABYLON.Axis.Z, -radian, BABYLON.Space.LOCAL);
            }
            if (scene.inputStates.down) {
                jet.rotate(BABYLON.Axis.Z, radian, BABYLON.Space.LOCAL);
            }
            if (scene.inputStates.left) {
                jet.rotate(BABYLON.Axis.X, radian * 7.5, BABYLON.Space.LOCAL);
            }
            if (scene.inputStates.right) {
                jet.rotate(BABYLON.Axis.X, -radian * 7.5, BABYLON.Space.LOCAL);
            }
            if (scene.inputStates.strafeL) {
                jet.rotate(BABYLON.Axis.Y, -radian * 5 / 100, BABYLON.Space.LOCAL);
            }
            if (scene.inputStates.strafeR) {
                jet.rotate(BABYLON.Axis.Y, radian * 5 / 100, BABYLON.Space.LOCAL);
            }


            if (scene.inputStates.shift) {
                if (jet.fireMode === "bullet") {
                    jet.fireMode = "rocket";
                } else {
                    jet.fireMode = "bullet";
                }
            }
            if(scene.inputStates.space) {
                if (jet.fireMode === "bullet") {
                    if (jet.canFire && jet.gunAmmunition > 0) {
                        // ok, we fire, let's put the above property to false
                        jet.canFire = false;
                        jet.gunAmmunition--;
                        document.getElementById("GUN-value").innerText = jet.gunAmmunition;

                        // let's be able to fire again after a while
                        setTimeout(() => {
                            jet.canFire = true;
                        }, 1000 * jet.fireAfter);

                        scene.assets.gunSound.setPosition(jet.position);
                        scene.assets.gunSound.setVolume(0.25);
                        scene.assets.gunSound.play();

                        // create a ray
                        let origin = jet.position; // position of the jet

                        let direction = new BABYLON.Vector3(
                            jet.frontVector.x,
                            jet.frontVector.y,
                            jet.frontVector.z
                        );

                        let length = 1000;
                        let ray = new BABYLON.Ray(origin, direction, length);

                        // to make the ray visible :
                        let rayHelper = new BABYLON.RayHelper(ray);
                        rayHelper.show(scene, new BABYLON.Color3.Red());

                        // to make ray disappear after 50ms
                        setTimeout(() => {
                            rayHelper.hide(ray);
                        }, 50);
                    } else if(jet.gunAmmunition === 0){
                        document.getElementById("GUN-label").style.color = "#f00";
                        document.getElementById("GUN-label").style.textShadow = "0px 0px 1px #f00";
                        document.getElementById("GUN-value").style.color = "#f00";
                        document.getElementById("GUN-value").style.textShadow = "0px 0px 1px #f00";
                        document.getElementById("GUN-value").innerText = "---";
                    }
                } else if (jet.fireMode === "rocket") {
                    if (jet.canFireRockets && jet.rocketAmmunition > 0) {
                        // ok, we fire, let's put the above property to false
                        jet.canFireRockets = false;
                        jet.rocketAmmunition--;
                        document.getElementById("MSL-value").innerText = jet.rocketAmmunition;

                        // let's be able to fire again after a while
                        setTimeout(() => {
                            jet.canFireRockets = true;
                        }, 1000 * jet.fireRocketsAfter);

                        scene.assets.rocketSound.setPosition(jet.position);
                        scene.assets.rocketSound.setVolume(0.25);
                        scene.assets.rocketSound.play();

                        // create a ray
                        let origin = jet.position; // position of the jet

                        let direction = new BABYLON.Vector3(
                            jet.frontVector.x,
                            jet.frontVector.y,
                            jet.frontVector.z
                        );

                        let length = 1000;
                        let ray = new BABYLON.Ray(origin, direction, length);

                        // to make the ray visible :
                        let rayHelper = new BABYLON.RayHelper(ray);
                        rayHelper.show(scene, new BABYLON.Color3.Red());

                        // to make ray disappear after 50ms
                        setTimeout(() => {
                            rayHelper.hide(ray);
                        }, 50);
                    } else if(jet.rocketAmmunition === 0){
                        document.getElementById("MSL-label").style.color = "#f00";
                        document.getElementById("MSL-label").style.textShadow = "0px 0px 1px #f00";
                        document.getElementById("MSL-value").style.color = "#f00";
                        document.getElementById("MSL-label").style.textShadow = "0px 0px 1px #f00";
                        document.getElementById("MSL-value").innerText = "---";
                    }
                }
            }
        }
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
    scene.inputStates.strafeL = false;
    scene.inputStates.strafeR = false;
    scene.inputStates.up = false;
    scene.inputStates.down = false;
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
            } else if(event.code === "Space") {
                scene.inputStates.space = false;
            } else if (event.code === "ShiftLeft") {
                scene.inputStates.shift = false;
            }
        },
        false
    );
}