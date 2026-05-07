const MODULE_ID = 'deck-of-destiny';
const COMPENDIUM_NAME = `${MODULE_ID}.destiny-tables`;
const POS_TABLE_NAME = "Positive Schicksalskarten";
const NEG_TABLE_NAME = "Negative Schicksalskarten";

Hooks.once('init', () => {
    console.log(`${MODULE_ID} | Initialisiere magisches Deck-System mit Kompendium...`);
});

Hooks.once('ready', async () => {
    if (game.user.isGM) {
        await ensureCompendiumFilled();
    }
    // Das HUD direkt beim Einloggen laden
    renderDestinyHUD();
});

// HUD aktualisieren, wenn Items erstellt, gelöscht oder geändert werden
Hooks.on('updateItem', (item) => { 
    if(item.name === "Beutel des Schicksals" || item.name === "Deck of Destiny") renderDestinyHUD(); 
});
Hooks.on('createItem', (item) => { 
    if(item.name === "Beutel des Schicksals" || item.name === "Deck of Destiny") renderDestinyHUD(); 
});
Hooks.on('deleteItem', (item) => { 
    if(item.name === "Beutel des Schicksals" || item.name === "Deck of Destiny") renderDestinyHUD(); 
});
Hooks.on('renderPlayerList', () => renderDestinyHUD());

async function ensureCompendiumFilled() {
    const pack = game.packs.get(COMPENDIUM_NAME);
    if (!pack) {
        console.error(`${MODULE_ID} | Kompendium ${COMPENDIUM_NAME} wurde nicht gefunden!`);
        return;
    }

    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({locked: false});

    await pack.getIndex();

    const positiveCards = [
        { n: "Der Ritter des Lichts", c: "Kampfeskraft", e: "Vorteil auf die nächsten 3 Angriffe + 1d8 gleißender Schaden.", i: "icons/magic/light/sword-light-large-yellow.webp" },
        { n: "Der sprudelnde Quell", c: "Ressourcen", e: "Stellt 2 Trefferwürfel & 1 Zauberplatz/Fähigkeit wieder her.", i: "icons/magic/water/pseudopod-swirl-blue.webp" },
        { n: "Die Schwingen des Sturms", c: "Mobilität", e: "+10 Fuß Bewegung, 3x Nebelschritt als Bonusaktion (1 Std).", i: "icons/magic/air/wind-weather-storm-blue.webp" },
        { n: "Der Blick der Ewigkeit", c: "Vorsehung", e: "Wahrer Blick (Truesight) für 30 Fuß (1 Std).", i: "icons/magic/perception/eye-ringed-glow-yellow.webp" },
        { n: "Der Funke der Schmiede", c: "Manifestation", e: "Aktuelle Waffe wird magisch (+1) & macht +1d4 Feuerschaden.", i: "icons/weapons/hammers/hammer-double-glowing-yellow.webp" },
        { n: "Die Stimme des Souveräns", c: "Charisma", e: "Vorteil auf Überzeugen/Einschüchtern, 1x Befehl frei.", i: "icons/equipment/head/crown-gold-ruby.webp" },
        { n: "Atem des uralten Wyrms", c: "Ermächtigung", e: "3x Drachenodem als Aktion (15-Fuß-Kegel, 4d6 Schaden).", i: "icons/magic/fire/projectile-fireball-orange.webp" },
        { n: "Bastion des Steinlords", c: "Umgebung", e: "Erschafft 15-Fuß-Zone mit halber Deckung & physischer Resistenz.", i: "icons/magic/earth/barrier-stone-pillar-purple.webp" },
        { n: "Das Herz des Phönix", c: "Heilung", e: "Verhindert Tod (fällt auf 1 HP) & heilt Gruppe um 2d8+4.", i: "icons/magic/life/heart-glowing-red.webp" },
        { n: "Der Zorn des Titanen", c: "Kampfeskraft", e: "1x bei Treffer: +3d10 Schaden, stößt Ziel weg & wirft es liegend.", i: "icons/skills/melee/strike-hammer-destructive-orange.webp" },
        { n: "Schlüssel der Welten", c: "Mobilität", e: "1x Klopfen oder Dimensionstür ohne Komponenten.", i: "icons/sundries/misc/key-steel.webp" },
        { n: "Spiegel der Vergeltung", c: "Defensive", e: "2x als Reaktion: Gegenschlag bei Schaden (3d10 Energieschaden).", i: "icons/equipment/shield/heater-crystal-blue.webp" },
        { n: "Buch der alten Pfade", c: "Wissen", e: "2 Skills (Int/Wis) erhalten Übung/Expertise; Verirren unmöglich.", i: "icons/sundries/books/book-open-glowing-blue.webp" },
        { n: "Träne der Erdmutter", c: "Vitalität", e: "Sämtliche erhaltene Heilung wird automatisch maximiert.", i: "icons/magic/nature/seed-glow-green.webp" },
        { n: "Mantel des Phantoms", c: "Tarnung", e: "Vorteil Heimlichkeit; 1x Unsichtbarkeit (keine Konzentration).", i: "icons/equipment/back/cloak-collared-black.webp" },
        { n: "Wirbelwind des Stahls", c: "Kampfdynamik", e: "1x zusätzliche Aktion im Zug (identisch mit Aktionswoge).", i: "icons/skills/melee/maneuver-greatsword-yellow.webp" },
        { n: "Biss der Blutgräfin", c: "Lebensraub", e: "Nächste 3 Angriffe heilen um exakt den verursachten Schaden.", i: "icons/magic/life/heart-cross-strong-red.webp" },
        { n: "Prisma des Magiers", c: "Abwehr", e: "1x Elementar absorbieren oder Gegenzauber als Reaktion frei.", i: "icons/magic/light/beam-deflect-purple.webp" },
        { n: "Der silberne Wächter", c: "Unterstützung", e: "1x Spirituelle Waffe als Bonusaktion (keine Konzentration).", i: "icons/creatures/mammals/wolf-howl-moon-white.webp" }
    ];

    const negativeCards = [
        { n: "Die Last der Erde", c: "Einschränkung", e: "Halbe Bewegungsrate & Nachteil auf Dex-Rettungswürfe.", i: "icons/magic/earth/strike-stone-crumble-brown.webp" },
        { n: "Der Schleier der Schatten", c: "Bürde", e: "Nachteil Wahrnehmung/Nachforschung & -5 Passive Wahrnehmung.", i: "icons/magic/death/undead-ghost-scream-teal.webp" },
        { n: "Das Mal des Gejagten", c: "Aura", e: "Feinde haben in den ersten 2 Kampfrunden Vorteil gegen dich.", i: "icons/magic/symbols/runes-star-pentagon-red.webp" },
        { n: "Die Klinge des Verrats", c: "Ausrüstung", e: "Entweder -2 auf Rüstungsklasse (AC) ODER -2 auf Waffenschaden.", i: "icons/weapons/swords/sword-broken-rusty-brown.webp" },
        { n: "Die Stille des Grabes", c: "Beraubung", e: "Kompletter Stimmverlust für 1 Stunde (kein verbales Zaubern).", i: "icons/magic/death/skull-energy-light-purple.webp" },
        { n: "Der Tribut des Blutes", c: "Entzug", e: "Das maximale Leben sinkt sofort um 2d10.", i: "icons/magic/blood/blood-drop-splash-red.webp" },
        { n: "Der gläserne Schild", c: "Verwundbarkeit", e: "Nachteil auf alle Rettungswürfe gegen Magie.", i: "icons/equipment/shield/buckler-wooden-broken-brown.webp" },
        { n: "Der gefräßige Schatten", c: "Manifestation", e: "Beschwört sofort einen feindlichen 'Schatten' (Monster).", i: "icons/magic/death/shadow-shape-humanoid-purple.webp" },
        { n: "Zerrissener Schicksalsfaden", c: "Pech", e: "Nächste gewürfelte Natürliche 20 wird zu einer Natürlichen 1.", i: "icons/sundries/gaming/dice-runed-brown.webp" },
        { n: "Der Odem der Wüste", c: "Erschöpfung", e: "Charakter erhält sofort eine Stufe der Erschöpfung.", i: "icons/magic/fire/wind-tornado-orange.webp" },
        { n: "Der astrale Parasit", c: "Ressourcen", e: "Zaubern/Fähigkeiten nutzen kostet eigene Trefferpunkte.", i: "icons/creatures/invertebrates/leech-bloodsucker-red.webp" },
        { n: "Die Ketten des Zögerns", c: "Einschränkung", e: "Nachteil Initiative & keine Bonus-/Reaktionen in Kampfrunde 1.", i: "icons/sundries/survival/watch-pocket-brass.webp" },
        { n: "Das wispernde Misstrauen", c: "Paranoia", e: "Charakter wehrt unbewusst Heilung/Buffs der Gruppe ab.", i: "icons/magic/control/fear-fright-white.webp" },
        { n: "Das Nest der Seuche", c: "Manifestation", e: "Beschwört sofort einen feindlichen Insektenschwarm (Monster).", i: "icons/creatures/invertebrates/centipede-giant-green.webp" },
        { n: "Das verfluchte Blut", c: "Heilungs-Blockade", e: "Jegliche erhaltene Heilung wird halbiert.", i: "icons/magic/blood/blood-drop-runes-red.webp" },
        { n: "Der Griff des Narren", c: "Einschränkung", e: "Nachteil Fingerfertigkeit/Angriffe; lässt Waffen bei Crit fallen.", i: "icons/magic/death/hand-undead-skeleton-purple.webp" },
        { n: "Der blinde Seher", c: "Beraubung", e: "Verlust jeglicher Dunkel-/Wahren Sicht; max 30 Fuß Sichtweite.", i: "icons/magic/perception/eye-tendrils-web-purple.webp" },
        { n: "Echo der Verdammnis", c: "Bürde", e: "Nachteil Charisma-Würfe, NPCs & Tiere reagieren feindselig.", i: "icons/creatures/birds/raven-flying-black.webp" },
        { n: "Die gläsernen Knochen", c: "Verwundbarkeit", e: "+1d4 Extra-Schaden bei jedem erlittenen physischen Treffer.", i: "icons/magic/death/skeleton-skull-soul-blue.webp" },
        { n: "Der Dieb der Sekunden", c: "Einschränkung", e: "Kompletter Verlust von Reaktionen (Gelegenheitsangriffe, Schild).", i: "icons/sundries/survival/hourglass-sand-flowing-yellow.webp" },
        { n: "Das eherne Joch", c: "Bürde", e: "Halbe Traglast & Nachteil auf Stärke-/Geschicklichkeits-Würfe.", i: "icons/equipment/neck/collar-iron-heavy.webp" },
        { n: "Der Schlund des Äthers", c: "Verlust", e: "Sofortiger Verlust des höchsten Zauberplatzes oder der halben Hit Dice.", i: "icons/magic/space/black-hole-purple-orange.webp" },
        { n: "Leuchtfeuer des Verrats", c: "Feindliche Aura", e: "Aktion 'Verstecken' unmöglich; Gegner wissen immer den Standort.", i: "icons/magic/light/explosion-star-red.webp" },
        { n: "Der zersplitterte Geist", c: "Verwundbarkeit", e: "Nachteil auf alle Int-, Wis- und Cha-Rettungswürfe.", i: "icons/magic/control/silhouette-mind-shatter-purple.webp" },
        { n: "Kuss des Rostmonsters", c: "Schwächung", e: "Aktuelle Waffe erhält -1 Malus ODER Rüstung -1 AC.", i: "icons/weapons/swords/sword-broad-rusty-brown.webp" },
        { n: "Der magnetische Fluch", c: "Zielscheibe", e: "Gegnerische Fernkampfangriffe erzielen bereits bei 19 einen Crit.", i: "icons/weapons/ammunition/arrow-magic-purple.webp" },
        { n: "Der greifende Sumpf", c: "Mobilitätsverlust", e: "Jegliches Terrain gilt als Schwieriges Gelände (halbe Bewegung).", i: "icons/magic/nature/root-vine-entangle-brown.webp" },
        { n: "Die eiserne Wahrheit", c: "Einschränkung", e: "Lügen unmöglich; Schmerz/Nachteil bei versuchter Täuschung.", i: "icons/sundries/scrolls/scroll-bound-runes-red.webp" },
        { n: "Der stählerne Dorn", c: "Schmerz", e: "Erleidet zusätzlich 1d4 Schaden bei gegnerischen Treffern (1x/Zug).", i: "icons/weapons/daggers/dagger-kriss-blood-red.webp" },
        { n: "Asche des Gefallenen", c: "Spuren", e: "Hinterlässt Aschespuren: Gegner haben Vorteil beim Verfolgen.", i: "icons/magic/fire/projectile-meteor-salvo-strong-orange.webp" },
        { n: "Labyrinth des Wahnsinns", c: "Kontrollverlust", e: "Aussetzen in Kampfrunde 1; würfelt stattdessen auf Verwirrungs-Tabelle.", i: "icons/magic/control/hypnosis-mesmerism-swirl.webp" },
        { n: "Die gespaltene Zunge", c: "Isolation", e: "Spricht nur noch Abgründig; normale Kommunikation blockiert.", i: "icons/creatures/reptiles/snake-cobra-bite-green.webp" }
    ];

    const generateResults = (cardsArray) => {
        return cardsArray.map((card, index) => {
            return {
                text: `<div class="dod-card-result"><b>${card.n}</b> <i>(${card.c})</i><br>${card.e}</div>`,
                type: 0,
                weight: 1,
                range: [index + 1, index + 1],
                img: card.i
            };
        });
    };

    const checkAndCreateTable = async (name, cardsArray) => {
        let tableEntry = pack.index.find(t => t.name === name);
        if (!tableEntry) {
            await RollTable.create({
                name: name,
                description: `Automatisch generiertes Deck für ${name}`,
                formula: `1d${cardsArray.length}`,
                results: generateResults(cardsArray)
            }, { pack: COMPENDIUM_NAME });
            ui.notifications.info(`Tabelle '${name}' wurde im Kompendium erstellt.`);
        }
    };

    await checkAndCreateTable(POS_TABLE_NAME, positiveCards);
    await checkAndCreateTable(NEG_TABLE_NAME, negativeCards);

    if (wasLocked) await pack.configure({locked: true});
}

// GM Sidebar Button
Hooks.on('getSceneControlButtons', (controls) => {
    if (!game.user.isGM) return;
    controls.push({
        name: "deck-of-destiny",
        title: "Deck of Destiny",
        icon: "fas fa-cards-blank",
        layer: "tokens",
        tools: [{
            name: "give-bag",
            title: "Beutel an Spieler vergeben",
            icon: "fas fa-shopping-bag",
            onClick: () => {
                const players = game.users.filter(u => !u.isGM && u.character);
                let options = players.map(p => `<option value="${p.character.id}">${p.character.name}</option>`).join('');
                
                new Dialog({
                    title: "Beutel vergeben",
                    content: `<form><label>Spieler wählen:</label><select id="player-select">${options}</select></form>`,
                    buttons: {
                        give: {
                            label: "Beutel geben",
                            callback: (html) => {
                                const actorId = html.find('#player-select').val();
                                giveBagToActor(actorId);
                            }
                        }
                    }
                }).render(true);
            },
            button: true
        }]
    });
});

async function giveBagToActor(actorId) {
    const actor = game.actors.get(actorId);
    const itemData = {
        name: "Beutel des Schicksals",
        type: "equipment",
        img: "icons/containers/bags/pouch-leather-brown.webp",
        system: {
            description: { value: "Ein magischer Beutel. Klicke im HUD, um Karten zu ziehen." },
            uses: { value: 1, max: 1, per: "lr" }
        }
    };
    await actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info(`${actor.name} hat den Beutel des Schicksals erhalten.`);
}

async function renderDestinyHUD() {
    const actor = game.user?.character;
    
    // Wenn kein Charakter gewählt ist oder er den Beutel nicht hat -> HUD entfernen
    if (!actor || !actor.items.find(i => i.name === "Beutel des Schicksals")) {
        $("#destiny-deck-hud").remove();
        return;
    }

    // Altes HUD entfernen, bevor wir es neu zeichnen
    if ($("#destiny-deck-hud").length) $("#destiny-deck-hud").remove();

    const bag = actor.items.find(i => i.name === "Beutel des Schicksals");
    const deck = actor.items.find(i => i.name === "Deck of Destiny");
    
    const bagClass = bag.system.uses.value === 0 ? "depleted" : "";
    const deckClass = (deck && deck.system.uses.value === 0) ? "depleted" : "";

    const hudHtml = `
        <div id="destiny-deck-hud" class="destiny-deck-hud">
            <div class="destiny-icon ${bagClass}" id="use-bag" title="Tägliche Ziehung (Beutel)">
                <img src="${bag.img}" />
            </div>
            ${deck ? `<div class="destiny-icon ${deckClass}" id="use-deck" title="Karte ausspielen (Deck)">
                <img src="${deck.img}" />
            </div>` : ''}
        </div>`;

    // Sicher verankert am UI-Layer
    $('#ui-bottom').append(hudHtml);

    // Klick-Events sicher binden
    $("#use-bag").on('click', function(e) {
        e.preventDefault();
        useBag(actor);
    });
    
    if (deck) {
        $("#use-deck").on('click', function(e) {
            e.preventDefault();
            useDeck(actor);
        });
    }
}

async function useBag(actor) {
    const bag = actor.items.find(i => i.name === "Beutel des Schicksals");
    if (bag.system.uses.value === 0) return ui.notifications.warn("Der Beutel ist für heute leer.");

    const pack = game.packs.get(COMPENDIUM_NAME);
    if (!pack) return ui.notifications.error("Kompendium nicht gefunden!");
    
    await pack.getIndex();
    const posTableEntry = pack.index.find(t => t.name === POS_TABLE_NAME);
    const negTableEntry = pack.index.find(t => t.name === NEG_TABLE_NAME);

    if (!posTableEntry || !negTableEntry) return ui.notifications.error("Die Rolltabellen fehlen im Kompendium!");

    const posTable = await pack.getDocument(posTableEntry._id);
    const negTable = await pack.getDocument(negTableEntry._id);

    // Deck erstellen, falls nicht vorhanden (Genesis)
    let deck = actor.items.find(i => i.name === "Deck of Destiny");
    if (!deck) {
        const deckData = {
            name: "Deck of Destiny",
            type: "equipment",
            img: "icons/sundries/gaming/cards-stack.webp",
            system: { uses: { value: 1, max: 1, per: "lr" } }
        };
        await actor.createEmbeddedDocuments("Item", [deckData]);
        
        const startDeckList = [];
        const posDraw1 = await posTable.roll(); const posDraw2 = await posTable.roll(); const posDraw3 = await posTable.roll();
        const negDraw1 = await negTable.roll(); const negDraw2 = await negTable.roll(); const negDraw3 = await negTable.roll();
        
        startDeckList.push(posDraw1.results[0].text, posDraw2.results[0].text, posDraw3.results[0].text);
        startDeckList.push(negDraw1.results[0].text, negDraw2.results[0].text, negDraw3.results[0].text);
        
        await actor.setFlag(MODULE_ID, 'activeDeck', startDeckList);
        await bag.update({"system.uses.value": 0});
        ChatMessage.create({ content: `<h3>Das Schicksal erwacht</h3><p>${actor.name} hat das erste Mal in den Beutel gegriffen. Das Deck of Destiny wurde erschaffen und enthält nun 6 Karten.</p>` });
        return; // HUD updated automatisch durch Hooks
    }

    // Reguläre tägliche Ziehung (1 Pos, 2 Neg)
    const draw1 = await posTable.roll();
    const draw2 = await negTable.roll();
    const draw3 = await negTable.roll();

    let currentCards = actor.getFlag(MODULE_ID, 'activeDeck') || [];
    currentCards.push(draw1.results[0].text, draw2.results[0].text, draw3.results[0].text);
    await actor.setFlag(MODULE_ID, 'activeDeck', currentCards);

    await bag.update({"system.uses.value": 0});
    ChatMessage.create({ content: `<h3>Schicksals-Ziehung</h3><p>${actor.name} zieht aus dem Beutel. 3 neue Karten wurden dem Deck of Destiny hinzugefügt.</p>` });
}

async function useDeck(actor) {
    const deck = actor.items.find(i => i.name === "Deck of Destiny");
    if (deck.system.uses.value === 0) return ui.notifications.warn("Das Deck kann erst nach einer Rast wieder genutzt werden.");

    let cards = actor.getFlag(MODULE_ID, 'activeDeck');
    if (!cards || cards.length === 0) return ui.notifications.error("Das Deck of Destiny ist leer!");

    const randomIndex = Math.floor(Math.random() * cards.length);
    const cardHTML = cards.splice(randomIndex, 1)[0];

    await actor.setFlag(MODULE_ID, 'activeDeck', cards);
    await deck.update({"system.uses.value": 0});

    ChatMessage.create({
        content: `<div class="dnd5e chat-card" style="padding: 10px; border: 1px solid #7a7971; border-radius: 5px; background: rgba(0,0,0,0.4);">
                    <h3 style="border-bottom: 1px solid #7a7971; margin-bottom: 5px;">Gezogene Karte</h3>
                    <p style="font-size: 1.1em;">${cardHTML}</p>
                    <p style="color: #a3a3a3; font-style: italic; margin-top: 10px;">Die Karte zerfällt augenblicklich zu Asche.</p>
                  </div>`
    });
}