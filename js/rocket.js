export function createAIMRocket(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("AIM120Rocket task", "", "./assets/models/AIM-120/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAIMRocketImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAIMRocketImported(meshes, particles, skeletons) {
        let AIMrocket = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = AIMrocket;
        localAxes.yAxis.parent = AIMrocket;
        localAxes.zAxis.parent = AIMrocket;

        AIMrocket.name = name;
        AIMrocket.speed = 22.5;
        AIMrocket.scaling.scaleInPlace(1.75);

        AIMrocket.position.x = position.x;
        AIMrocket.position.y = position.y;
        AIMrocket.position.z = position.z;
    }
}

export function createAGMRocket(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("AGMrocket task", "", "./assets/models/AGM-88/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAGMRocketImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAGMRocketImported(meshes, particles, skeletons) {
        let AGMrocket = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = AGMrocket;
        localAxes.yAxis.parent = AGMrocket;
        localAxes.zAxis.parent = AGMrocket;

        AGMrocket.name = name;
        AGMrocket.speed = 22.5;
        AGMrocket.scaling.scaleInPlace(0.35);

        AGMrocket.position.x = position.x;
        AGMrocket.position.y = position.y;
        AGMrocket.position.z = position.z;
    }
}

export function rocketStatus(scene, rocket) {

    try {
        if(rocket.parent === null) {
            rocket.moveWithCollisions(rocket.right.multiplyByFloats(rocket.speed, rocket.speed, rocket.speed));

            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture("./assets/models/particles/flare.png", scene);

            // Where the particles come from
            particleSystem.emitter = rocket; // the starting object, the emitter
            particleSystem.minEmitBox = new BABYLON.Vector3(-2, 0, 0); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(-50, 0, 0); // To...

            // Colors of all particles
            particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
            particleSystem.color2 = new BABYLON.Color4(0.5, 0.5, 0.5, 0.5);
            particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.25;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.1;
            particleSystem.maxLifeTime = 0.1;

            // Emission rate
            particleSystem.emitRate = 5;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = -rocket.right;
            particleSystem.direction2 = -rocket.right;

            // Angular speed, in radians
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;

            // Speed
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 3;
            particleSystem.updateSpeed = 0.005;

            particleSystem.isLocal = true;

            // Start the particle system
            particleSystem.start();
            
            // change this with fuction wich check collisions
            setTimeout(() => {
                rocket.dispose();
            }, 5000);
        }
    } catch (error) {}
}