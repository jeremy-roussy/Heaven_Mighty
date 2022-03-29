import { angleBetweenXaxis } from './math.js';
import { createBullet } from './bullet.js';

export function createJet(scene) {

    var meshTask = scene.assetsManager.addMeshTask("jet task", "", "./assets/models/F16/", "scene.gltf", scene);

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

        jet.position.y = 1500;
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

        // to avoid firing too many missiles rapidly
        jet.missileAmmunition = 6;
        jet.canFireMissile = true;
        jet.fireMissilesAfter = 1; // in seconds

        // to avoid firing too many flares rapidly
        jet.flareAmmunition = 8;
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
                if (jet.speed < 20) jet.speed += 0.25;
            }
            if (scene.inputStates.arrowDown) {
                if (jet.speed > 0) jet.speed -= 0.25;
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
                    
                    scene.assets.chaffsFlareAlertSound.play();
                    scene.assets.flareSound.play();

                    // Create a particle system
                    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

                    //Texture of each particle
                    particleSystem.particleTexture = new BABYLON.Texture("./assets/models/particles/flare.png", scene);

                    // Where the particles come from
                    particleSystem.emitter = jet; // the starting object, the emitter
                    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
                    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

                    // Colors of all particles
                    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
                    particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.5);
                    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 1.0);

                    // Size of each particle (random between...
                    particleSystem.minSize = 1;
                    particleSystem.maxSize = 1;

                    // Life time of each particle (random between...
                    particleSystem.minLifeTime = 50;
                    particleSystem.maxLifeTime = 50;

                    // Emission rate
                    particleSystem.emitRate = 3.5;

                    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
                    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

                    // Set the gravity of all particles
                    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

                    // Direction of each particle after it has been emitted
                    particleSystem.direction1 = jet.frontVector;
                    particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

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

                    if (jet.flareAmmunition === 0) {
                        changeStatus("FLR");
                        document.getElementById("FLR-value").innerText = "---";
                    }
                }
            }
            if (scene.inputStates.shift) {
                if (jet.canChangeMode) {
                    jet.canChangeMode = false;

                    if (jet.fireMode === "bullet") {
                        jet.fireMode = "missile";
                        document.getElementById("selector").style.top = "170px";
                    } else {
                        jet.fireMode = "bullet";
                        document.getElementById("selector").style.top = "150px";
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

                        scene.assets.gunSound.play();

                        if (jet.gunAmmunition === 0) {
                            changeStatus("GUN");
                            document.getElementById("GUN-value").innerText = "---";
                        }
                    }
                } else if (jet.fireMode === "missile") {
                    if (jet.canFireMissile && jet.missileAmmunition > 0) {

                        switch (jet.missileAmmunition) {
                            case 6:
                                jet.removeChild(scene.getMeshByName("leftAIM_120"));
                                break;
                            case 5:
                                jet.removeChild(scene.getMeshByName("rightAIM_120"));
                                break;
                            case 4:
                                jet.removeChild(scene.getMeshByName("leftAIM_9"));
                                break;
                            case 3:
                                jet.removeChild(scene.getMeshByName("rightAIM_9"));
                                break;
                            case 2:
                                jet.removeChild(scene.getMeshByName("leftAGM_88"));
                                break;
                            case 1:
                                jet.removeChild(scene.getMeshByName("rightAGM_88"));
                                break;
                        }

                        // ok, we fire, let's put the above property to false
                        jet.canFireMissile = false;
                        jet.missileAmmunition--;
                        document.getElementById("MSL-value").innerText = jet.missileAmmunition;

                        // let's be able to fire again after a while
                        setTimeout(() => {
                            jet.canFireMissile = true;
                        }, 1000 * jet.fireMissilesAfter);
                        
                        scene.assets.missileSound.play();

                        if (jet.missileAmmunition === 0) {
                            changeStatus("MSL");
                            document.getElementById("MSL-value").innerText = "---";
                        }
                    }
                }
            }
        }

        jet.verifyAltitude = () => {
            // update altimeter value
            displayOnAltimeter(jet);

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
            } catch (error) { }

            try {
                let pickInfo = scene.pickWithRay(rayRadarF, (mesh) => { return (mesh.name === "ground"); });
                groundDistance = BABYLON.Vector3.Distance(jet.position, pickInfo.pickedPoint);
            } catch (error) { }

            if (jet.position.y < groundHeight) {
                jet.crash();
            } else if ((jet.position.y - groundHeight < distanceAlert && groundDistance < distanceAlert) || groundDistance < distanceAlert) {
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
                        // ok, alert is triggered, let's put the above property to false
                        jet.canPlayAlert = false;

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

        jet.verifyLatitude = () => {
            let directionDegrees = angleBetweenXaxis(jet.frontVector);

            let latitude = -174 + (116 / 90) * directionDegrees;

            document.getElementById("cardinal").style.transform = "translateX(" + latitude + "px)";
            document.getElementById("measures").style.transform = "translateX(" + latitude + "px)";
        }

        jet.crash = () => {
            //scene.assets.explosion.setPosition(jet.position);
            scene.assets.explosion.play();

            scene.assets.engineSound.stop();
            
            changeStatus("DMG");
            document.getElementById("DMG-value").innerText = "100%";

            document.getElementById("hologram-jet").src = "./assets/models/F16/F16_hologram_red.png";

            jet.dispose();
        }
    }
}

function displayOnAltimeter(jet) {
    let altitude = Math.round(jet.position.y);
    let digit = altitude.toString().split("");

    if (altitude < 10) {
        document.getElementById("thousand").innerText = 0;
        document.getElementById("hundred").innerText = 0;
        document.getElementById("ten").innerText = 0;
        document.getElementById("unit").innerText = digit[0];
    } else if (altitude < 100) {
        document.getElementById("thousand").innerText = 0;
        document.getElementById("hundred").innerText = 0;
        document.getElementById("ten").innerText = digit[0];
        document.getElementById("unit").innerText = digit[1];
    } else if (altitude < 1000) {
        document.getElementById("thousand").innerText = 0;
        document.getElementById("hundred").innerText = digit[0];
        document.getElementById("ten").innerText = digit[1];
        document.getElementById("unit").innerText = digit[2];
    } else {
        document.getElementById("thousand").innerText = digit[0];
        document.getElementById("hundred").innerText = digit[1];
        document.getElementById("ten").innerText = digit[2];
        document.getElementById("unit").innerText = digit[3];
    }

    document.getElementById("arrow").style.transform = "rotate(" + (90 + altitude * 360 / 10000) + "deg)";
}

function changeStatus(id) {
    let label = id + "-label";
    let value = id + "-value";

    document.getElementById(label).style.color = "#f00";
    document.getElementById(label).style.textShadow = "0px 0px 1px #f00";
    document.getElementById(value).style.color = "#f00";
    document.getElementById(value).style.textShadow = "0px 0px 1px #f00";
}