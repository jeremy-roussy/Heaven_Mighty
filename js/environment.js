export function createEnvironment(scene) {
    createGround(scene);
    //createSky(scene);
    scene.createDefaultLight();
    //createDynamicTerrain(scene);
}

function createSky(scene, jet) {
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

    var meshTask = scene.assetsManager.addMeshTask("ground task", "", "./assets/environment/", "ground.babylon", scene);
    
    meshTask.onSuccess = function (task) {

        onGroundImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onGroundImported(meshes, particles, skeletons) {
        let ground = meshes[0];
        let scale = 50

        ground.name = "ground";
        ground.scaling.scaleInPlace(scale);

        ground.position = new BABYLON.Vector3(0, scale * 30, 0);
        
        // to be taken into account by collision detection
        ground.checkCollisions = true;

        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.MeshImpostor,
            { mass: 0 },
            scene
        );
        
        return ground;
    }
}

function createDynamicTerrain(scene) {
    // Declare a callback function that will be executed once the heightmap file is downloaded
    // This function is passed the generated data and the number of points on the map height and width
    var terrain;
    var createTerrain = function (mapData, mapSubX, mapSubZ) {
        var options = {
            terrainSub: 100,  // 100 x 100 quads
            mapData: mapData, // the generated data received
            mapSubX: mapSubX, mapSubZ: mapSubZ // the map number of points per dimension
        };
        terrain = new BABYLON.DynamicTerrain("dt", options, scene);
        terrain.createUVMap();      // compute also the UVs
        terrain.mesh.material = someMaterial;
        // etc about the terrain ...
        // terrain.updateCameraLOD = function(camera) { ... }
    };

    // Create the map from the height map and call the callback function when done
    var hmURL = "https://www.babylonjs.com/assets/heightMap.png";  // heightmap file URL
    var hmOptions = {
        width: 5000, height: 4000,          // map size in the World 
        subX: 1000, subZ: 800,              // number of points on map width and height
        onReady: createTerrain              // callback function declaration
    };
    var mapData = new Float32Array(1000 * 800 * 3); // the array that will store the generated data
    BABYLON.DynamicTerrain.CreateMapFromHeightMapToRef(hmURL, hmOptions, mapData, scene);
}