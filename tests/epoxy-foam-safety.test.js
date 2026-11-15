const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('background safety avoids heated PU and generic resin safety deadlines',()=>{
 const s=fs.readFileSync('artikel/3d-rueckwand-aquarium-bauen.html','utf8');
 assert.doesNotMatch(s,/chemisch inert und völlig unbedenklich|geruchsfrei und ungiftig|Nach weiteren 24–48 Stunden|Ausgehärteter PU-Schaum ist ungiftig|Nur <strong>2K-Schaum|oder einem Heißdraht-Schneidegerät schneidest/);
 for(const p of [/PU-Schaum nicht mit Heißdraht/,/Geruchsfreiheit ist kein Sicherheitsnachweis/,/keine allgemeine Freigabe/,/r-g\.de/,/cdc\.gov/,/soudal\.com\.au/])assert.match(s,p);
 assert.doesNotMatch(fs.readFileSync('artikel/iwagumi-aquascape-2026-schritt-fuer-schritt-zum-minimalistischen-stein-layout-mi.html','utf8'),/oder Epoxidharz, um die Steine/);
});
