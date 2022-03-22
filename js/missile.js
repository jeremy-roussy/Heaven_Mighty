export function createAIM_120(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("AIM120 task", "", "./assets/models/AIM-120/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAIM_120Imported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAIM_120Imported(meshes, particles, skeletons) {
        let AIM_120 = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = AIM_120;
        localAxes.yAxis.parent = AIM_120;
        localAxes.zAxis.parent = AIM_120;

        AIM_120.name = name;
        AIM_120.speed = 22.5;
        AIM_120.scaling.scaleInPlace(1.75);

        AIM_120.position.x = position.x;
        AIM_120.position.y = position.y;
        AIM_120.position.z = position.z;
    }
}

export function createAIM_9(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("AIM9 task", "", "./assets/models/AIM-9/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAIM_9Imported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAIM_9Imported(meshes, particles, skeletons) {
        let AIM_9 = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = AIM_9;
        localAxes.yAxis.parent = AIM_9;
        localAxes.zAxis.parent = AIM_9;

        AIM_9.name = name;
        AIM_9.speed = 22.5;
        AIM_9.scaling.scaleInPlace(0.9);

        AIM_9.position.x = position.x;
        AIM_9.position.y = position.y;
        AIM_9.position.z = position.z;
    }
}

export function createAGM(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("AGM task", "", "./assets/models/AGM-88/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAGMImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAGMImported(meshes, particles, skeletons) {
        let AGM = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = AGM;
        localAxes.yAxis.parent = AGM;
        localAxes.zAxis.parent = AGM;

        AGM.name = name;
        AGM.speed = 22.5;
        AGM.scaling.scaleInPlace(0.35);

        AGM.position.x = position.x;
        AGM.position.y = position.y;
        AGM.position.z = position.z;
    }
}

export function missileStatus(scene, missile) {

    try {
        if(missile.parent === null) {
            missile.moveWithCollisions(missile.right.multiplyByFloats(missile.speed, missile.speed, missile.speed));

            /*
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture("./assets/models/particles/flare.png", scene);

            // Where the particles come from
            particleSystem.emitter = missile; // the starting object, the emitter
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
            particleSystem.direction1 = -.right;
            particleSystem.direction2 = -.right;

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
            */
            
            // change this with fuction wich check collisions
            setTimeout(() => {
                missile.dispose();
            }, 5000);
        }
    } catch (error) {}
}