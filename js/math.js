export function degToRad(deg) {
    return (Math.PI * deg) / 180
}

export function radToDeg(rad) {
    return (rad * 180) / Math.PI
}

export function angleBetweenXaxis(normal) {
    let vec = normal;
    vec.y = 0;

    let normalizedVec = BABYLON.Vector3.Normalize(vec);
    
    let north = new BABYLON.Vector3(0, 0, -1);
    let dotVec = BABYLON.Vector3.Dot(north, normalizedVec);
    
    let angleRadians = Math.acos(dotVec);
    let angleDeegres = radToDeg(angleRadians);

    // To make angle from 0 to 360
    if (normalizedVec.x < 0) {
        angleDeegres = 360 - angleDeegres;
    }

    return angleDeegres.toFixed(2);
}