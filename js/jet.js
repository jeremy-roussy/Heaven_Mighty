import { createBullet } from './bullet.js';

export function createJet(scene) {

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
        jet.scaling.scaleInPlace(1);

        jet.position.y = 2500;
        jet.speed = 10;
        jet.fireMode = "bullet";

        jet.alert = "";
        jet.canPlayAlert = true;

        // to avoid change mode too rapidly
        jet.canChangeMode = true;
        jet.changeModeAfter = 0.5; // in seconds

        // to avoid firing too many lasers rapidly
        jet.gunAmmunition = 2400;
        jet.canFire = true;
        jet.fireAfter = 0.01; // in seconds

        // to avoid firing too many rockets rapidly
        jet.rocketAmmunition = 2;
        jet.canFireRockets = true;
        jet.fireRocketsAfter = 2; // in seconds

        // to avoid firing too many flares rapidly
        jet.flareAmmunition = 4;
        jet.canFireFlares = true;
        jet.fireFlaresAfter = 1; // in seconds

        jet.move = () => {

            let radian = Math.PI / 180;
            jet.frontVector = localAxes.xAxis.forward;

            jet.moveWithCollisions(
                jet.frontVector.multiplyByFloats(jet.speed, jet.speed, jet.speed)
            );

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
            if (scene.inputStates.arrowUp) {
                jet.speed += 0.1;
                if (jet.speed > 20) jet.speed = 20;
            }
            if (scene.inputStates.arrowDown) {
                jet.speed -= 0.1;
                if (jet.speed < 1) jet.speed = 1;
            }
            if (scene.inputStates.f) {
                if (jet.canFireFlares && jet.flareAmmunition > 0) {
                    // ok, we fire, let's put the above property to false
                    jet.canFireFlares = false;
                    jet.flareAmmunition--;
                    document.getElementById("FLR-value").innerText = jet.flareAmmunition;

                    // let's be able to fire again after a while
                    setTimeout(() => {
                        jet.canFireFlares = true;
                    }, 1000 * jet.fireFlaresAfter);

                    scene.assets.chaffsFlareAlertSound.setPosition(jet.position);
                    scene.assets.chaffsFlareAlertSound.setVolume(0.25);
                    scene.assets.chaffsFlareAlertSound.play();

                    scene.assets.flareSound.setPosition(jet.position);
                    scene.assets.flareSound.setVolume(0.5);
                    scene.assets.flareSound.play();

                } else if (jet.flareAmmunition === 0) {
                    changeStatus("FLR");
                }
            }
            if (scene.inputStates.shift) {
                if (jet.canChangeMode) {
                    jet.canChangeMode = false;

                    if (jet.fireMode === "bullet") {
                        jet.fireMode = "rocket";
                        document.getElementById("selector").style.bottom = "240px";
                    } else {
                        jet.fireMode = "bullet";
                        document.getElementById("selector").style.bottom = "260px";
                    }

                    setTimeout(() => {
                        jet.canChangeMode = true;
                    }, 1000 * jet.changeModeAfter);
                }
            }
            if (scene.inputStates.space) {
                if (jet.fireMode === "bullet") {
                    if (jet.canFire && jet.gunAmmunition > 0) {
                        // ok, we fire, let's put the above property to false
                        jet.canFire = false;
                        jet.gunAmmunition--;
                        document.getElementById("GUN-value").innerText = jet.gunAmmunition;

                        createBullet(scene, jet);

                        // let's be able to fire again after a while
                        setTimeout(() => {
                            jet.canFire = true;
                        }, 1000 * jet.fireAfter);

                        scene.assets.gunSound.setPosition(jet.position);
                        scene.assets.gunSound.setVolume(0.25);
                        scene.assets.gunSound.play();
                    } else if (jet.gunAmmunition === 0) {
                        changeStatus("GUN");
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
                    } else if (jet.rocketAmmunition === 0) {
                        changeStatus("MSL");
                    }
                }
            }
        }

        jet.verifyAltitude = () => {
            // create a ray that starts from the jet, and goes down vertically
            let rayRadarD = new BABYLON.Ray(jet.position, new BABYLON.Vector3(0, -1, 0), 10000);
            // create a ray that starts from the jet, and goes forward vertically
            let rayRadarF = new BABYLON.Ray(jet.position, jet.frontVector, 10000);
            
            let groundHeight = 0;
            let groundDistance = 10000;

            let distanceAlert = 50 * jet.speed;
        
            try {
                let pickInfo = scene.pickWithRay(rayRadarD, (mesh) => { return (mesh.name === "ground"); });
                groundHeight = pickInfo.pickedPoint.y + 2.5;
            } catch (error) {}
        
            try {
                let pickInfo = scene.pickWithRay(rayRadarF, (mesh) => { return (mesh.name === "ground"); });
                groundDistance = BABYLON.Vector3.Distance(jet.position, pickInfo.pickedPoint);
            } catch (error) {}
        
            if (jet.position.y < groundHeight) {
                jet.crash();
            } else if ((jet.position.y - groundHeight < distanceAlert && groundDistance < distanceAlert) || groundDistance < distanceAlert)  {
                jet.alert = "PULL UP";
            } else {
                jet.alert = "";
            }
        }

        jet.messageAlert = () => {
            if (jet.alert != "") {
                let element = document.getElementById("alert");

                element.innerText = jet.alert;
                element.style.display = "block";

                if (jet.alert === "MISSILE ALERT") {
                    if (jet.canPlayAlert) {
                        // ok, we fire, let's put the above property to false
                        jet.canPlayAlert = false;

                        scene.assets.missileAlertSound.setPosition(jet.position);
                        scene.assets.missileAlertSound.setVolume(0.5);
                        scene.assets.missileAlertSound.play();

                        setTimeout(() => {
                            jet.canPlayAlert = true;
                        }, 1825);
                    }
                }
                if (jet.alert === "PULL UP") {
                    if (jet.canPlayAlert) {
                        // ok, we fire, let's put the above property to false
                        jet.canPlayAlert = false;

                        scene.assets.pullUpAlertSound.setPosition(jet.position);
                        scene.assets.pullUpAlertSound.setVolume(0.25);
                        scene.assets.pullUpAlertSound.play();

                        setTimeout(() => {
                            jet.canPlayAlert = true;
                        }, 1500);
                    }
                }
            } else {
                document.getElementById("alert").style.display = "none";
            }
        }

        jet.crash = () => {
            scene.assets.explosion.setPosition(jet.position);
            scene.assets.explosion.play();

            jet.dispose();
        }
    }
}

function changeStatus(id) {
    let label = id + "-label";
    let value = id + "-value";

    document.getElementById(label).style.color = "#f00";
    document.getElementById(label).style.textShadow = "0px 0px 1px #f00";
    document.getElementById(value).style.color = "#f00";
    document.getElementById(value).style.textShadow = "0px 0px 1px #f00";
    document.getElementById(value).innerText = "---";
}