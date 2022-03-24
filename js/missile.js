export function createMissile(scene, type, position, coordinate) {
    let scale = 1;

    if (type === "AIM_120") scale = 1.75;
    else if (type === "AIM_9") scale = 0.9;
    else scale = 0.35;

    var meshTask = scene.assetsManager.addMeshTask("missile task", "", "./assets/models/" + type + "/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onMissileImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onMissileImported(meshes, particles, skeletons) {
        let missile = meshes[0];

        missile.name = position + type;
        missile.speed = 22.5;
        missile.scaling.scaleInPlace(scale);

        missile.position.x = coordinate.x;
        missile.position.y = coordinate.y;
        missile.position.z = coordinate.z;
    }
}

export function missileStatus(scene, missile) {
    try {
        if (missile.parent === null) {
            missile.moveWithCollisions(missile.right.multiplyByFloats(missile.speed, missile.speed, missile.speed));

            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture("./assets/models/particles/flare.png", scene);

            // Where the particles come from
            particleSystem.emitter = missile; // the starting object, the emitter
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

            // Colors of all particles
            particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
            particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.5);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 1.0);

            // Size of each particle (random between...
            particleSystem.minSize = 0.25;
            particleSystem.maxSize = 0.25;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.375;
            particleSystem.maxLifeTime = 0.375;

            // Emission rate
            particleSystem.emitRate = 3.5;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = -missile.right;
            particleSystem.direction2 = -missile.right;

            // Angular speed, in radians
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = 0;

            // Speed
            particleSystem.minEmitPower = 6;
            particleSystem.maxEmitPower = 10;
            particleSystem.updateSpeed = 0.05;

            particleSystem.createSphereEmitter(0);

            // Start the particle system
            particleSystem.start();

            // make it stop after 300ms
            setTimeout(() => {
                particleSystem.stop();
            }, 300);

            // change missile with fuction wich check collisions
            setTimeout(() => {
                missile.dispose();
            }, 5000);
        }
    } catch (error) { }
}