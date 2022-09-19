export function createFollowCamera(scene, target) {
    let targetName = target.name;

    // use the target name to name the camera
    let camera = new BABYLON.FollowCamera(
        targetName + "FollowCamera",
        new BABYLON.Vector3(target.position.x, target.position.y, target.position.z),
        scene,
        target
    );

    // default values
    camera.radius = 0; // how far from the object to follow
    camera.heightOffset = 0; // how high above the object to place the camera
    camera.rotationOffset = 0; // the viewing angle
    camera.cameraAcceleration = 0.1; // how fast to move
    camera.maxCameraSpeed = 20; // speed limit
    camera.noRotationConstraint = false;

    return camera;
}

export function createFreeCamera(scene, initialPosition) {
    let camera = new BABYLON.FreeCamera("freeCamera", initialPosition, scene);
    camera.attachControl(canvas);
  
    return camera;
}