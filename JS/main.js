/* Imports ---------------*/

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable, MotionPathPlugin, InertiaPlugin)

/* Variables ---------------*/

let section1 = document.querySelector("#section1");
let avion = document.querySelector("#movingBlock1");
let section4 = document.querySelector("#section4");
let avionDraggable = document.querySelector("#movingBlock4");
let zoneAeroport = document.querySelector("#zoneAeroport");
let carteAeroport = document.querySelector("#carteAeroport");
let carteAeroportVisible = false;

/* Fonctions---------------*/

// Garde une marge pendant le passage de l'avion au centre.
function limiteAvion() {
    let marge = Math.max(16, section1.clientHeight * 0.05);
    return Math.max(0, (section1.clientHeight - avion.offsetHeight) / 2 - marge);
}

// Suit l'aeroport de gauche dans le fond 1600 x 900, affiche en cover.
function positionnerZoneAeroport() {
    let largeur = section4.clientWidth;
    let hauteur = section4.clientHeight;
    let echelle = Math.max(largeur / 1600, hauteur / 900);
    let decalageY = (hauteur - 900 * echelle) / 2;
    let haut = Math.max(0, decalageY + 600 * echelle);
    let bas = Math.min(hauteur, decalageY + 750 * echelle);

    gsap.set(zoneAeroport, {
        left: 0,
        top: haut,
        width: Math.min(largeur, 340 * echelle),
        height: Math.max(0, bas - haut),
    });
}

function verifierZoneAeroport() {
    // Deux seuils evitent que la carte clignote au bord de la zone.
    let seuil = carteAeroportVisible ? "10%" : "25%";
    let dansZone = zoneAeroport.offsetHeight > 0 &&
        Draggable.hitTest(avionDraggable, zoneAeroport, seuil);

    if (dansZone === carteAeroportVisible) return;

    carteAeroportVisible = dansZone;
    carteAeroport.setAttribute("aria-hidden", String(!dansZone));

    gsap.to(carteAeroport, {
        autoAlpha: dansZone ? 1 : 0,
        y: dansZone ? 0 : 20,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
    });
}


/* Animation avion section 1--------------*/

let tlAvion = gsap.timeline({
    scrollTrigger: {
        trigger: "#section1",
        start: "top top",
        end: "+=200%",
        scrub: true,
        pin: true,
        markers: false,
        id: "section1",
        invalidateOnRefresh: true,
    },
});

// Entre depuis au-dessus de la section, puis ralentit avant le centre.
tlAvion.fromTo("#movingBlock1", {
    y: () => -(section1.clientHeight + avion.offsetHeight) / 2 - 1,
    autoAlpha: 1,
    rotation: 180,
}, {
    y: () => -limiteAvion() * 0.25,
    autoAlpha: 1,
    rotation: 180,
    duration: 2,
    ease: "power1.out",
})
// Traverse lentement le centre.
.to("#movingBlock1", {
    y: () => limiteAvion() * 0.25,
    duration: 2,
    ease: "none",
})
// Reaccelere et sort entierement par le bas de la section.
.to("#movingBlock1", {
    y: () => (section1.clientHeight + avion.offsetHeight) / 2 + 1,
    duration: 1,
    ease: "power2.in",
});

// Calcule l'espace du pin avant l'animation de la section 2.
tlAvion.scrollTrigger.refresh();

/* Animation premier block--------------*/

gsap.to("#movingBlock2", {
        scrollTrigger: {
            trigger: "#section2",
            start: "top 99%",
            end: "top 1%",
            scrub: 1,
            markers: false,
            id: "section2",
            toggleActions: "play none reverse reset",
        },
        
        rotation: 360,
        duration: 2,
    }); 


    /* Animation troisième bloc */
let tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
});
tl.to("#movingBlock3", { x: 100 })
  .to("#movingBlock3", { y: 100 })
  .to("#movingBlock3", { x: -100 })
  .to("#movingBlock3", { y: -100 });

  /* animation quatrieme bloc */

  positionnerZoneAeroport();

  let dragAvion = Draggable.create("#movingBlock4", {
    //type: "x",
    //type: "rotation",
    bounds: "#section4",
    inertia: true,
    dragResistance: 0,
    minimumMovement: 1,
    cursor: "grab",
    activeCursor: "grabbing",
    zIndexBoost: false,
    onDrag: verifierZoneAeroport,
    onDragEnd: verifierZoneAeroport,
    onThrowUpdate: verifierZoneAeroport,
    onThrowComplete: verifierZoneAeroport,
})[0];

window.addEventListener("resize", function () {
    positionnerZoneAeroport();
    dragAvion.applyBounds();
    verifierZoneAeroport();
});
