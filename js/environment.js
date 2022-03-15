export function createEnvironment(scene) {
    createGround(scene);
    createSky(scene);
    createLights(scene);
}

function createSky(scene) {
    let dome = new BABYLON.PhotoDome(
        "skydome",
        "./assets/environment/sky2.jpg",
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
        onReady: onGroundCreated
    };

    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "./assets/environment/map.jpg",               // you can choose map2.jpg
        groundOptions,
        scene
    );

    // const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./assets/environment/map4.png", {width:10000, height:10000, subdivisions: 1000, minHeight:0, maxHeight: 3000});
    // const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "./assets/environment/map3.png", {width:10000, height:10000, subdivisions: 750, minHeight:0, maxHeight: 3000});

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("./assets/environment/rock3.jpg");
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

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight(
        "dir0",
        new BABYLON.Vector3(-1, -1, 0),
        scene
    );
}