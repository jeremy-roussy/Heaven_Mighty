export function loadSounds(scene) {
    var assetsManager = scene.assetsManager;

    var binaryTask = assetsManager.addBinaryFileTask("gunSound", "./assets/sounds/bullet.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.gunSound = new BABYLON.Sound("gun", task.data, scene, null, {
            loop: false
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("missileSound", "./assets/sounds/missile.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.missileSound = new BABYLON.Sound("missile", task.data, scene, null, {
            loop: false
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("flareSound", "./assets/sounds/multipleFlare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.flareSound = new BABYLON.Sound("flare", task.data, scene, null, {
            loop: false
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("missileAlertSound", "./assets/sounds/missileAlert.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.missileAlertSound = new BABYLON.Sound("missileAlert", task.data, scene, null, {
            loop: false
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("pullUpAlertSound", "./assets/sounds/VWS/pull-up.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.pullUpAlertSound = new BABYLON.Sound("pullUpAlert", task.data, scene, null, {
            loop: false
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("chaffsFlareAlertSound", "./assets/sounds/VWS/chaffs-flare.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.chaffsFlareAlertSound = new BABYLON.Sound("chaffsFlareAlert", task.data, scene, null, {
            loop: false
        });
    };    

    binaryTask = assetsManager.addBinaryFileTask("engineSound", "./assets/sounds/moteur4.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.engineSound = new BABYLON.Sound("engine", task.data, scene, null, {
            loop: true,
            autoplay: true
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("skyCrawlers", "./assets/sounds/friendly-duel.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.skyCrawlersMusic = new BABYLON.Sound( "skyCrawlers", task.data, scene, null, {
            loop: true,
            autoplay: true
        });
    };

    binaryTask = assetsManager.addBinaryFileTask("explosion", "./assets/sounds/explosion.mp3");
    binaryTask.onSuccess = function (task) {
        scene.assets.explosion = new BABYLON.Sound("explosion", task.data, scene, null, {
            loop: false,
            spatialSound: true
        });
    };
}

export function soundVolume(scene) {
    scene.assets.skyCrawlersMusic.setVolume(scene.musicVolume);
    
    scene.assets.engineSound.setVolume(0.5 * scene.effectsVolume);
    scene.assets.gunSound.setVolume(0.5 * scene.effectsVolume);
    scene.assets.missileSound.setVolume(0.5 * scene.effectsVolume);
    scene.assets.missileAlertSound.setVolume(scene.effectsVolume);
    scene.assets.flareSound.setVolume(0.2 * scene.effectsVolume);
    scene.assets.chaffsFlareAlertSound.setVolume(0.5 * scene.effectsVolume);
    scene.assets.pullUpAlertSound.setVolume(0.5 * scene.effectsVolume);
    scene.assets.explosion.setVolume(scene.effectsVolume);
}