export function createFuelTank(scene, name, position) {

    var meshTask = scene.assetsManager.addMeshTask("fuelTank task", "", "./assets/models/fuel_tank/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onFuelTankImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onFuelTankImported(meshes, particles, skeletons) {
        let fuelTank = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = fuelTank;
        localAxes.yAxis.parent = fuelTank;
        localAxes.zAxis.parent = fuelTank;

        fuelTank.name = name;
        fuelTank.scaling.scaleInPlace(0.85);

        fuelTank.position.x = position.x;
        fuelTank.position.y = position.y;
        fuelTank.position.z = position.z;
    }
}