/* Plugins GSAP -------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable, MotionPathPlugin, InertiaPlugin);

/* Section 1 : avion au scroll ----------------------------------- */

// L'avion traverse la section du haut vers le bas, au rythme du scroll.
// 100vh correspond à une hauteur d'écran : l'avion commence et finit hors de la section.
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
        invalidateOnRefresh: true, // Adapte le trajet à la hauteur de l'écran.
    },
});

// Calcule l'espace du pin avant l'animation de la section 2.
animationAvion.scrollTrigger.refresh();

// Les deux cartes de cette section restent visibles dès le chargement.

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
    rotation: 360 * 3, // Trois tours complets sur toute la traversée.
    duration: 2,
    ease: "none", // Pas d'accélération ajoutée à la progression de la rotation.
});

// Les deux cartes du moteur restent visibles, sans animation d'apparition.

/* Section 3 : avion draggable et cartes ------------------------- */

// Récupère l'avion à déplacer grâce à son id dans le HTML.
let avionDraggable = document.querySelector("#movingBlock3");

// Chaque étape associe une zone invisible à sa carte dans le HTML.
// visible mémorise l'état de la carte pour éviter de relancer son animation.
let depart = {
    zone: document.querySelector("#zoneAeroport"),
    carte: document.querySelector("#carteAeroport"),
    visible: false,
};

let ciel = {
    zone: document.querySelector("#zoneCiel"),
    carte: document.querySelector("#carteCiel"),
    visible: false,
};

let arrivee = {
    zone: document.querySelector("#zoneArrivee"),
    carte: document.querySelector("#carteArrivee"),
    visible: false,
};

// Cette fonction sert aux trois étapes. autorisee indique si la carte peut apparaître.
function verifierCarte(etape, autorisee) {
    // Le seuil de 25 % évite d'afficher une carte dès que l'avion effleure une zone.
    let seuil = "25%";

    // Une carte déjà visible reste affichée un peu plus longtemps pour éviter le clignotement.
    if (etape.visible) {
        seuil = "10%";
    }

    let dansZone = false;

    if (autorisee) {
        // hitTest vérifie si l'avion touche suffisamment la zone.
        dansZone = Draggable.hitTest(avionDraggable, etape.zone, seuil);
    }

    // Si rien n'a changé, on conserve l'animation en cours.
    if (dansZone === etape.visible) {
        return;
    }

    etape.visible = dansZone;

    // Affiche la carte quand l'avion entre dans la zone, puis la cache quand il en sort.
    // aria-hidden indique aussi aux lecteurs d'écran si la carte est cachée.
    if (dansZone) {
        etape.carte.setAttribute("aria-hidden", "false");
        gsap.to(etape.carte, {
            autoAlpha: 1, // Rend la carte visible.
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true, // Remplace le fondu précédent si l'avion change vite de zone.
        });
    } else {
        etape.carte.setAttribute("aria-hidden", "true");
        gsap.to(etape.carte, {
            autoAlpha: 0, // Cache la carte.
            y: 20,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
        });
    }
}

function verifierZonesAvion() {
    // Vérifie d'abord le ciel : cette carte est prioritaire.
    verifierCarte(ciel, true);

    // true autorise la carte ; false la cache, même si l'avion touche sa zone.
    if (ciel.visible) {
        verifierCarte(depart, false);
        verifierCarte(arrivee, false);
    } else if (dragAvion.x <= 0) {
        // L'avion est à gauche de sa position de départ.
        verifierCarte(depart, true);
        verifierCarte(arrivee, false);
    } else {
        // L'avion est à droite de sa position de départ.
        verifierCarte(depart, false);
        verifierCarte(arrivee, true);
    }
}

// Active le glisser-déposer. [0] récupère l'instance de cet avion dans la liste créée.
let dragAvion = Draggable.create("#movingBlock3", {
    bounds: "#section3", // L'avion reste dans les limites de la section.
    inertia: true, // Continue un peu le mouvement après le relâchement.
    dragResistance: 0, // Suit la souris sans résistance.
    minimumMovement: 1, // Le drag commence dès un déplacement de 1 px.
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

// Une fois la page chargée, actualise les repères des animations au scroll.
window.addEventListener("load", function () {
    ScrollTrigger.refresh();
});
