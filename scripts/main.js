const MODULE_ID = 'deck-of-destiny';
const COMPENDIUM_NAME = `${MODULE_ID}.destiny-tables`;
const POS_TABLE_NAME = "Positive Schicksalskarten";
const NEG_TABLE_NAME = "Negative Schicksalskarten";

Hooks.once('init', () => {
    console.log(`${MODULE_ID} | Initialisiere Deck of Destiny...`);
});

Hooks.once('ready', async () => {
    if (game.user.isGM) {
        await ensureCompendiumFilled();
    }
    renderDestinyHUD();
});

// Automatische HUD-Aktualisierung
Hooks.on('updateItem', (item) => { if (item.name.includes("Schicksal") || item.name.includes("Destiny")) renderDestinyHUD(); });
Hooks.on('createItem', (item) => { if (item.name.includes("Schicksal") || item.name.includes("Destiny")) renderDestinyHUD(); });
Hooks.on('deleteItem', (item) => { if (item.name.includes("Schicksal") || item.name.includes("Destiny")) renderDestinyHUD(); });
Hooks.on('controlToken', () => renderDestinyHUD()); // Update wenn GM einen Token anklickt

async function ensureCompendiumFilled() {
    const pack = game.packs.get(COMPENDIUM_NAME);
    if (!pack) return;
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({locked: false});
    await pack.getIndex();

    const positiveCards = [
        { n: "Der Ritter des Lichts", c: "Kampfeskraft", e: "Vorteil auf die nächsten 3 Angriffe + 1d8 gleißender Schaden.", i: "icons/magic/light/sword-light-large-yellow.webp" },
        { n: "Der sprudelnde Quell", c: "Ressourcen", e: "Stellt 2 Trefferwürfel & 1 Zauberplatz/Fähigkeit wieder her.", i: "icons/magic/water/pseudopod-swirl-blue.webp" },
        { n: "Die Schwingen des Sturms", c: "Mobilität", e: "+10 Fuß Bewegung, 3x Nebelschritt als Bonusaktion (1 Std).", i: "icons/magic/air/wind-weather-storm-blue.webp" }
        // ... (weitere Karten hier weggelassen für die Übersicht, behalte deine Liste einfach bei)
    ];

    const negativeCards = [
        { n: "Die Last der Erde", c: "Einschränkung", e: "Halbe Bewegungsrate & Nachteil auf Dex-Rettungswürfe.", i: "icons/magic/earth/strike-stone-crumble-brown.webp" },
        { n: "Der Schleier der Schatten", c: "Bürde", e: "Nachteil Wahrnehmung/Nachforschung & -5 Passive Wahrnehmung.", i: "icons/magic/death/undead-ghost-scream-teal.webp" }
        // ... (weitere Karten hier weggelassen)
    ];

    const generateResults = (cardsArray) => cardsArray.map((card, index) => ({
        text: `<div class="dod-card-result"><b>${card.n}</b> <i>(${card.c})</i><br>${card.e}</div>`,
        type: 0, weight: 1, range: [index + 1, index + 1], img: card.i
    }));

    const checkAndCreateTable = async (name, cardsArray) => {
        let tableEntry = pack.index.find(t => t.name === name);
        if (!tableEntry) {
            await RollTable.create({
                name: name,
                formula: `1d${cardsArray.length}`,
                results: generateResults(cardsArray)
            }, { pack: COMPENDIUM_NAME });
        }
    };

    await checkAndCreateTable(POS_TABLE_NAME, positiveCards);
    await checkAndCreateTable(NEG_TABLE_NAME, negativeCards);
    if (wasLocked) await pack.configure({locked: true});
}

async function renderDestinyHUD() {
    const isGM = game.user.isGM;
    const actor = game.user.character || (canvas.tokens.controlled[0]?.actor); // Nimmt aktiven Charakter oder ausgewählten Token
    
    if ($("#destiny-deck-hud").length) $("#destiny-deck-hud").remove();

    let buttonsHtml = "";

    // GM-Spezifischer Button (Zuweisung)
    if (isGM) {
        buttonsHtml += `
            <div class="destiny-icon gm-icon" id="gm-assign-deck" title="Beutel an Spieler vergeben">
                <i class="fas fa-users-cog"></i>
            </div>`;
    }

    // Spieler-Buttons (nur wenn Beutel im Inventar)
    const bag = actor?.items.find(i => i.name === "Beutel des Schicksals");
    if (bag) {
        const deck = actor.items.find(i => i.name === "Deck of Destiny");
        const bagUses = getProperty(bag, "system.uses.value") ?? 1;
        const deckUses = deck ? (getProperty(deck, "system.uses.value") ?? 1) : 0;

        buttonsHtml += `
            <div class="destiny-icon ${bagUses === 0 ? 'depleted' : ''}" id="use-bag" title="Tägliche Ziehung">
                <img src="${bag.img}" />
            </div>`;
        
        if (deck) {
            buttonsHtml += `
                <div class="destiny-icon ${deckUses === 0 ? 'depleted' : ''}" id="use-deck" title="Karte ausspielen">
                    <img src="${deck.img}" />
                </div>`;
        }
    }

    // HUD nur anzeigen, wenn es Buttons gibt
    if (buttonsHtml === "") return;

    const hudHtml = `<div id="destiny-deck-hud" class="destiny-deck-hud">${buttonsHtml}</div>`;
    $('body').append(hudHtml);
}

// --- EVENT DELEGATION ---

$(document).off('click', '#gm-assign-deck').on('click', '#gm-assign-deck', function(e) {
    e.preventDefault();
    const characters = game.actors.filter(a => a.type === "character");
    let options = characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    new Dialog({
        title: "Beutel des Schicksals vergeben",
        content: `<form><div class="form-group"><label>Charakter wählen:</label><select id="player-select">${options}</select></div></form>`,
        buttons: {
            give: {
                icon: '<i class="fas fa-check"></i>',
                label: "Beutel überreichen",
                callback: (html) => {
                    const actorId = html.find('#player-select').val();
                    const actor = game.actors.get(actorId);
                    giveBagToActor(actor);
                }
            }
        }
    }).render(true);
});

$(document).off('click', '#use-bag').on('click', '#use-bag', async function(e) {
    e.preventDefault();
    const actor = game.user.character || (canvas.tokens.controlled[0]?.actor);
    if (actor) useBag(actor);
});

$(document).off('click', '#use-deck').on('click', '#use-deck', async function(e) {
    e.preventDefault();
    const actor = game.user.character || (canvas.tokens.controlled[0]?.actor);
    if (actor) useDeck(actor);
});

async function giveBagToActor(actor) {
    const itemData = {
        name: "Beutel des Schicksals",
        type: "equipment",
        img: "icons/containers/bags/pouch-leather-brown.webp",
        system: { description: { value: "Ein magischer Beutel." }, uses: { value: 1, max: 1, per: "lr" } }
    };
    await actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info(`${actor.name} hat den Beutel erhalten.`);
}

async function useBag(actor) {
    const bag = actor.items.find(i => i.name === "Beutel des Schicksals");
    if ((getProperty(bag, "system.uses.value") ?? 1) === 0) return ui.notifications.warn("Bereits benutzt.");

    const pack = game.packs.get(COMPENDIUM_NAME);
    await pack.getIndex();
    const posTable = await pack.getDocument(pack.index.find(t => t.name === POS_TABLE_NAME)._id);
    const negTable = await pack.getDocument(pack.index.find(t => t.name === NEG_TABLE_NAME)._id);

    let deck = actor.items.find(i => i.name === "Deck of Destiny");
    if (!deck) {
        const deckData = { name: "Deck of Destiny", type: "equipment", img: "icons/sundries/gaming/cards-stack.webp", system: { uses: { value: 1, max: 1, per: "lr" } } };
        await actor.createEmbeddedDocuments("Item", [deckData]);
        const startCards = [];
        for(let i=0; i<3; i++) { startCards.push((await posTable.roll()).results[0].text); startCards.push((await negTable.roll()).results[0].text); }
        await actor.setFlag(MODULE_ID, 'activeDeck', startCards);
    } else {
        const currentCards = actor.getFlag(MODULE_ID, 'activeDeck') || [];
        currentCards.push((await posTable.roll()).results[0].text);
        currentCards.push((await negTable.roll()).results[0].text);
        currentCards.push((await negTable.roll()).results[0].text);
        await actor.setFlag(MODULE_ID, 'activeDeck', currentCards);
    }
    await bag.update({"system.uses.value": 0});
    ChatMessage.create({ content: `<h3>Ziehung</h3>${actor.name} hat Karten gezogen.` });
}

async function useDeck(actor) {
    const deck = actor.items.find(i => i.name === "Deck of Destiny");
    if ((getProperty(deck, "system.uses.value") ?? 1) === 0) return ui.notifications.warn("Ladung verbraucht.");
    let cards = actor.getFlag(MODULE_ID, 'activeDeck');
    if (!cards?.length) return ui.notifications.error("Deck leer.");

    const card = cards.splice(Math.floor(Math.random() * cards.length), 1)[0];
    await actor.setFlag(MODULE_ID, 'activeDeck', cards);
    await deck.update({"system.uses.value": 0});
    ChatMessage.create({ content: `<div class="dnd5e chat-card"><h3>Karte</h3><p>${card}</p></div>` });
}