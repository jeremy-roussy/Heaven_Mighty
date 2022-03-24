export function createBullet(scene, jet) {
    // Create a bullet
    let bullet = BABYLON.MeshBuilder.CreateSphere(
        "bullet",
        { diameter: 0.1 },
        scene
    );

    bullet.material = new BABYLON.StandardMaterial("yellow", scene);
    bullet.material.emissiveColor = new BABYLON.Color3(0.8,0.8,0.4);
    
    // position the bullet
    bullet.position = new BABYLON.Vector3(jet.position.x, jet.position.y, jet.position.z);

    // add physics to the bullet, mass must be non null to see gravity apply
    bullet.physicsImpostor = new BABYLON.PhysicsImpostor(
        bullet,
        BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 0.1 },
        scene
    );

    // the bullet needs to be fired, so we need an impulse !
    // we apply it to the center of the sphere
    let powerOfFire = 250;
    let aimForceVector = new BABYLON.Vector3(
        jet.frontVector.x * powerOfFire,
        jet.frontVector.y * powerOfFire,
        jet.frontVector.z * powerOfFire
      );

    bullet.physicsImpostor.applyImpulse(aimForceVector, bullet.getAbsolutePosition());

    bullet.actionManager = new BABYLON.ActionManager(scene);

    // Make the cannonball disappear after 0.5s
    setTimeout(() => {
        bullet.dispose();
      }, 500);
}