/* Plugins GSAP -------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable, MotionPathPlugin, InertiaPlugin);

/* Section 1 : avion au scroll ----------------------------------- */

// L'avion traverse la section du haut vers le bas, au rythme du scroll.
// pour que l'avion commence et finit hors de la section.
let animationAvion = gsap.fromTo("#movingBlock1", {
    y: "-100vh",
    rotation: 180,
    autoAlpha: 1,
}, {
    y: "100vh",
    ease: "none",
    scrollTrigger: {
        trigger: "#section1",
        start: "top top",
        end: "+=200%", // Étale l'animation sur deux hauteurs d'écran de scroll.
        scrub: true, // La progression de l'animation suit le scroll.
        pin: true, // Maintient la section à l'écran pendant cette animation.
        markers: false,
        id: "section1",

    },
});

// Calcule l'espace du pin avant l'animation de la section 2.
animationAvion.scrollTrigger.refresh();

/* Section 2 : rotation des pales -------------------------------- */

// Fait tourner uniquement les pales pendant le passage de la section à l'écran.
gsap.to("#movingBlock2", {
    scrollTrigger: {
        trigger: "#section2",
        start: "top bottom", // Début quand la section entre par le bas de l'écran.
        end: "bottom top", // Fin quand la section sort par le haut.
        scrub: 0.4, // Lisse le mouvement avec un rattrapage de 0,4 seconde.
        markers: false,
        id: "section2",
    },
    rotation: 1080, // Trois tours complets
    duration: 2,
    ease: "none", 
});

/* Section 3 : avion draggable et cartes ------------------------- */

// Récupère l'avion à déplacer grâce à son id dans le HTML.
let avionDraggable = document.querySelector("#movingBlock3");

// Chaque étape associe une zone invisible à sa carte dans le HTML.
// visible mémorise l'état de la carte pour éviter de relancer son animation.
// document.querySelector() récupère le premier élément HTML correspondant à un sélecteur CSS.
// Ici, "#movingBlock3" cible l'avion grâce à son id ; le # désigne un id, comme en CSS.
// Si aucun élément ne correspond, querySelector() renvoie null.
let etapesVoyage = {
    depart: {
        zone: document.querySelector("#zoneAeroport"),
        carte: document.querySelector("#carteAeroport"),
        visible: false,
    },
    ciel: {
        zone: document.querySelector("#zoneCiel"),
        carte: document.querySelector("#carteCiel"),
        visible: false,
    },
    arrivee: {
        zone: document.querySelector("#zoneArrivee"),
        carte: document.querySelector("#carteArrivee"),
        visible: false,
    },
};

// Fonction commune aux trois cartes ; autorisee permet de donner priorité à une autre.
function verifierCarte(etape, autorisee = true) {
    // Plus de chevauchement est nécessaire à l'entrée qu'à la sortie : évite le clignotement.
    let seuil = etape.visible ? "10%" : "25%";
    // hitTest vérifie si le rectangle de l'avion recouvre suffisamment celui de la zone.
    let dansZone = autorisee && Draggable.hitTest(avionDraggable, etape.zone, seuil);

    // Si rien n'a changé, on conserve l'animation en cours.
    if (dansZone === etape.visible) return;

    etape.visible = dansZone;
    etape.carte.setAttribute("aria-hidden", String(!dansZone)); // Informe aussi les lecteurs d'écran.

    // Affiche la carte en fondu et la remonte de 20 px ; fait l'inverse à la sortie.
    gsap.to(etape.carte, {
        autoAlpha: dansZone ? 1 : 0, // Gère ensemble l'opacité et la visibilité.
        y: dansZone ? 0 : 20,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true, // Remplace l'animation précédente si l'on change vite de zone.
    });
}

function verifierZonesAvion() {
    // L'avion part du centre : x est négatif à gauche et positif à droite.
    let avionAGauche = dragAvion.x <= 0;

    // Le ciel est prioritaire ; sinon, une seule carte latérale est autorisée.
    verifierCarte(etapesVoyage.ciel);
    verifierCarte(etapesVoyage.depart, avionAGauche && !etapesVoyage.ciel.visible);
    verifierCarte(etapesVoyage.arrivee, !avionAGauche && !etapesVoyage.ciel.visible);
}

// Active le glisser-déposer. [0] récupère l'instance de cet avion dans la liste créée.
let dragAvion = Draggable.create("#movingBlock3", {
    bounds: "#section3", // pour pas que ca sorte de l'ecran
    inertia: true, 
    dragResistance: 0, // 0 resitance
    minimumMovement: 1, 
    cursor: "grab",
    activeCursor: "grabbing",
    zIndexBoost: false, // Conserve l'ordre d'affichage défini dans le CSS.
    onDrag: verifierZonesAvion, // Pendant le déplacement à la souris.
    onDragEnd: verifierZonesAvion, // Au relâchement.
    onThrowUpdate: verifierZonesAvion, // Pendant le mouvement dû à l'inertie.
    onThrowComplete: verifierZonesAvion, // À l'arrêt complet.
})[0];

// Les zones suivent le CSS ; au redimensionnement, recale l'avion et vérifie les cartes.
window.addEventListener("resize", function () {
    dragAvion.applyBounds();
    verifierZonesAvion();
});
