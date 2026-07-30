// Roguelike Campaign Logic

let allWeapons = []; // Array of objects { name, tier }
let allTools = [];
let allConsumables = [];

// Default State
let state = {
    isActive: false,
    strikes: 0,
    currentNode: 1,
    stash: { weapons: [], tools: [], consumables: [] },
    traderDeals: null
};

// Events removed, we use Trader now

const missions = [
    "MISSION: Extract with at least one Bounty Token",
    "MISSION: Secure at least 3 Kills",
    "MISSION: Extract with at least one Bounty Token and get 3 kills",
    "MISSION: Secure at least 5 Kills",
    "BOSS MISSION: Extract Full Bounty + Secure 3 Kills + Survive!"
];

const debuffs = [
    "DEBUFF: Start with one missing health chunk.",
    "DEBUFF: No secondary weapons allowed.",
    "DEBUFF: No Medkits allowed.",
    "DEBUFF: No Traits permitted on any Hunters."
];

// Elements
const strikeCountEl = document.getElementById("strikeCount");
const timelineEl = document.getElementById("timelineContainer");
const nodeTitleEl = document.getElementById("nodeTitle");
const nodeContentEl = document.getElementById("nodeContent");
const nodeActionsEl = document.getElementById("nodeActions");
const resetBtn = document.getElementById("resetCampaignBtn");

const stashWeaponsEl = document.getElementById("stashWeapons");
const stashToolsEl = document.getElementById("stashTools");
const stashConsumablesEl = document.getElementById("stashConsumables");
const wCountEl = document.getElementById("weaponCount");
const tCountEl = document.getElementById("toolCount");
const cCountEl = document.getElementById("consumableCount");

// Init
Promise.all([
    fetch('data/weapons.json').then(res => res.json()),
    fetch('data/tools_consumables.json').then(res => res.json()),
    fetch('spreadsheets/weapon_stats.csv').then(res => res.text())
]).then(([weapons, tools, csv]) => {

    // Parse CSV to get tiers
    const weaponTiers = {};
    csv.split('\n').slice(1).forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',');
        weaponTiers[parts[0].trim()] = parseInt(parts[3].trim());
    });

    // Parse Weapons (Base only, No Duel guns)
    weapons.forEach(slotData => {
        let baseWeapons = slotData.weapons.filter(w => w.base === 1 && !w.weapon.endsWith('_duel'));
        baseWeapons.forEach(w => {
            allWeapons.push({
                name: w.weapon,
                tier: weaponTiers[w.weapon] || 1 // default tier 1 if missing
            });
        });
    });

    // Parse Tools
    allTools = [...tools.tools[0].melees, ...tools.tools[0].first_aid, ...tools.tools[0].others];

    // Parse Consumables
    allConsumables = [...tools.consumables.shots, ...tools.consumables.throwables, ...tools.consumables.placeables];

    loadState();
    renderAll();
});

function loadState() {
    const saved = localStorage.getItem('huntRoguelikeState');
    if (saved) {
        state = JSON.parse(saved);
    } else {
        startNewRun();
    }
}

function saveState() {
    localStorage.setItem('huntRoguelikeState', JSON.stringify(state));
}

function getRandomItems(pool, count) {
    let selected = [];
    if (pool.length === 0) return selected;
    for (let i = 0; i < count; i++) {
        selected.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return selected;
}

function getAffordableItems(stashArray, count) {
    if (stashArray.length < count) return null;
    let shuffled = [...stashArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function startNewRun() {
    let tier1Weapons = allWeapons.filter(w => w.tier === 1).map(w => w.name);
    state = {
        isActive: true,
        strikes: 0,
        currentNode: 1,
        traderDeals: null,
        stash: {
            weapons: getRandomItems(tier1Weapons, 6),
            tools: getRandomItems(allTools, 9),
            consumables: getRandomItems(allConsumables, 12)
        }
    };
    saveState();
}

function renderAll() {
    strikeCountEl.textContent = state.strikes;
    renderTimeline();
    renderStash();
    renderNode();
}

window.removeItem = function (category, index) {
    if (!confirm("Permanently remove this item from the Stash?")) return;
    state.stash[category].splice(index, 1);
    saveState();
    renderStash();
}

function renderStash() {
    if (!state) return;

    wCountEl.textContent = state.stash.weapons.length;
    stashWeaponsEl.innerHTML = "";
    state.stash.weapons.forEach((w, index) => {
        let div = document.createElement("div");
        div.className = "image-slot clickable";
        div.style.width = "120px";
        div.style.height = "45px";
        div.style.border = "none";
        div.style.padding = "0";
        div.style.margin = "0";
        div.style.backgroundColor = "transparent";
        let picName = w;
        if (picName.endsWith("_duel")) picName = picName.slice(0, -5);
        div.innerHTML = `<img src="images/weapons/${picName}.png" alt="${w}" title="${w}">`;
        div.onclick = () => window.removeItem('weapons', index);
        stashWeaponsEl.appendChild(div);
    });

    tCountEl.textContent = state.stash.tools.length;
    stashToolsEl.innerHTML = "";
    state.stash.tools.forEach((t, index) => {
        let div = document.createElement("div");
        div.className = "tool-slot clickable";
        div.style.width = "120px";
        div.style.height = "45px";
        div.style.border = "none";
        div.style.padding = "0";
        div.style.margin = "0";
        div.style.backgroundColor = "transparent";
        div.innerHTML = `<img src="images/tools_consumables/${t}.png" alt="${t}" title="${t}" style="width:100%; height:100%; object-fit:contain;">`;
        div.onclick = () => window.removeItem('tools', index);
        stashToolsEl.appendChild(div);
    });

    cCountEl.textContent = state.stash.consumables.length;
    stashConsumablesEl.innerHTML = "";
    state.stash.consumables.forEach((c, index) => {
        let div = document.createElement("div");
        div.className = "tool-slot clickable";
        div.style.width = "120px";
        div.style.height = "45px";
        div.style.border = "none";
        div.style.padding = "0";
        div.style.margin = "0";
        div.style.backgroundColor = "transparent";
        div.innerHTML = `<img src="images/tools_consumables/${c}.png" alt="${c}" title="${c}" style="width:100%; height:100%; object-fit:contain;">`;
        div.onclick = () => window.removeItem('consumables', index);
        stashConsumablesEl.appendChild(div);
    });
}

function renderTimeline() {
    timelineEl.innerHTML = "";
    for (let i = 1; i <= 15; i++) {
        let type = "Loot";
        if (i % 3 === 2) type = "Trader";
        if (i % 3 === 0) type = "Mission";
        if (i === 15) type = "Boss";

        let div = document.createElement("div");
        div.className = "timeline-node";
        div.textContent = i + " " + type;

        if (i < state.currentNode) div.classList.add("completed");
        else if (i === state.currentNode) div.classList.add("active");
        if (i === 15) div.classList.add("boss");

        timelineEl.appendChild(div);
    }
}

function advanceNode() {
    if (state.currentNode === 15) {
        alert("YOU WON THE CAMPAIGN!");
        startNewRun();
    } else {
        state.currentNode++;
        state.traderDeals = null;
    }
    saveState();
    renderAll();
}

window.gainStrike = function () {
    state.strikes++;
    if (state.strikes >= 3) {
        alert("3 STRIKES! GAME OVER! Your team has been wiped. Restarting campaign...");
        startNewRun();
    }
    saveState();
    renderAll();
}

function renderNode() {
    const n = state.currentNode;
    nodeActionsEl.innerHTML = "";

    if (n % 3 === 1) { // LOOT NODE
        nodeTitleEl.textContent = `Node ${n}: Loot Cache`;
        nodeContentEl.innerHTML = `<p>You found a supply cache! Click below to add randomized gear to your Team Stash.</p>`;

        let allowedTiers = [1];
        if (n >= 4 && n < 7) allowedTiers = [1, 2];
        if (n >= 7 && n < 10) allowedTiers = [2];
        if (n >= 10 && n < 13) allowedTiers = [2, 3];
        if (n >= 13) allowedTiers = [3];

        let btn = document.createElement("button");
        btn.textContent = "Open Loot Cache";
        btn.onclick = () => {
            let weaponPool = allWeapons.filter(w => allowedTiers.includes(w.tier)).map(w => w.name);

            let newWeapons = getRandomItems(weaponPool, 2);
            let newTools = getRandomItems(allTools, 2);
            let newConsumables = getRandomItems(allConsumables, 4);

            state.stash.weapons.push(...newWeapons);
            state.stash.tools.push(...newTools);
            state.stash.consumables.push(...newConsumables);
            saveState();

            // Display the loot visually using stash-grid CSS
            let lootHtml = `<p><strong>Loot Acquired:</strong></p>
                            <div class="mini-stash-grid" style="margin-bottom: 20px;">`;
            newWeapons.forEach(w => lootHtml += `<div class="image-slot" style="width:120px; height:45px; border:none; padding:0; margin:0; background:transparent;"><img src="images/weapons/${w}.png" title="${w}" style="width:100%; height:100%; object-fit:contain;"></div>`);
            newTools.forEach(t => lootHtml += `<div class="tool-slot" style="width:120px; height:45px; border:none; padding:0; margin:0; background:transparent;"><img src="images/tools_consumables/${t}.png" title="${t}" style="width:100%; height:100%; object-fit:contain;"></div>`);
            newConsumables.forEach(c => lootHtml += `<div class="tool-slot" style="width:120px; height:45px; border:none; padding:0; margin:0; background:transparent;"><img src="images/tools_consumables/${c}.png" title="${c}" style="width:100%; height:100%; object-fit:contain;"></div>`);
            lootHtml += `</div>`;

            nodeContentEl.innerHTML = lootHtml;

            nodeActionsEl.innerHTML = "";
            let advanceBtn = document.createElement("button");
            advanceBtn.textContent = "Continue to next node";
            advanceBtn.onclick = () => advanceNode();
            nodeActionsEl.appendChild(advanceBtn);
        };
        nodeActionsEl.appendChild(btn);

    } else if (n % 3 === 2) { // TRADER NODE
        nodeTitleEl.textContent = `Node ${n}: Trader`;

        let allowedTiers = [1];
        if (n >= 4 && n < 7) allowedTiers = [1, 2];
        if (n >= 7 && n < 10) allowedTiers = [2];
        if (n >= 10 && n < 13) allowedTiers = [2, 3];
        if (n >= 13) allowedTiers = [3];

        if (!state.traderDeals) {
            let wPool = allWeapons.filter(w => allowedTiers.includes(w.tier)).map(w => w.name);
            let tcPool = [...allTools, ...allConsumables];
            state.traderDeals = [];

            for (let i = 0; i < 3; i++) {
                let playerWeapons = state.stash.weapons;
                let playerTC = [...state.stash.tools, ...state.stash.consumables];

                let possibleTypes = [];
                if (playerWeapons.length >= 1) possibleTypes.push(1);
                if (playerTC.length >= 2) possibleTypes.push(2);
                if (playerWeapons.length >= 1) possibleTypes.push(3);
                if (playerTC.length >= 2) possibleTypes.push(4);

                let type = 1;
                if (possibleTypes.length > 0) {
                    type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
                }

                let giveW = [], giveTC = [], recW = [], recTC = [];

                if (type === 1) {
                    giveW = getAffordableItems(playerWeapons, 1) || [];
                    recW = getRandomItems(wPool, 1);
                } else if (type === 2) {
                    giveTC = getAffordableItems(playerTC, 2) || [];
                    recW = getRandomItems(wPool, 1);
                } else if (type === 3) {
                    giveW = getAffordableItems(playerWeapons, 1) || [];
                    recTC = getRandomItems(tcPool, 2);
                } else if (type === 4) {
                    giveTC = getAffordableItems(playerTC, 2) || [];
                    recTC = getRandomItems(tcPool, 2);
                }
                state.traderDeals.push({ type, giveW, giveTC, recW, recTC, available: true });
            }
            saveState();
        }

        let html = `<p>The Trader offers you these deals:</p><div style="display:flex; flex-direction:column; gap:20px;">`;

        state.traderDeals.forEach((deal, idx) => {
            let giveHtml = [...deal.giveW, ...deal.giveTC].map(i => {
                let isWeapon = deal.giveW.includes(i);
                let w = isWeapon ? '90px' : '60px';
                let h = isWeapon ? '40px' : '60px';
                return `<img src="${isWeapon ? 'images/weapons' : 'images/tools_consumables'}/${i}.png" style="width:${w}; height:${h}; object-fit:contain; border: 1px solid #555; background:#222;">`;
            }).join(" + ");

            let recHtml = [...deal.recW, ...deal.recTC].map(i => {
                let isWeapon = deal.recW.includes(i);
                let w = isWeapon ? '90px' : '60px';
                let h = isWeapon ? '40px' : '60px';
                return `<img src="${isWeapon ? 'images/weapons' : 'images/tools_consumables'}/${i}.png" style="width:${w}; height:${h}; object-fit:contain; border: 1px solid #ffea00; background:#222;">`;
            }).join(" + ");

            html += `<div style="display:flex; align-items:center; gap: 15px; background-color: #1a1819; padding: 15px; border: 1px solid #6A5852; border-radius: 5px;">
                        <div style="flex:1;"><strong>TRADE:</strong> <br>${giveHtml}</div>
                        <div style="font-size: 24px; font-weight: bold;">&#8594;</div>
                        <div style="flex:1;"><strong>FOR:</strong> <br>${recHtml}</div>
                        <button id="dealBtn${idx}" class="equip-btn" style="padding: 10px 20px; font-size: 16px;">Accept Deal</button>
                     </div>`;
        });
        html += `</div>`;
        nodeContentEl.innerHTML = html;

        state.traderDeals.forEach((deal, idx) => {
            let btn = document.getElementById(`dealBtn${idx}`);
            if (!deal.available) {
                btn.textContent = "Sold Out";
                btn.style.backgroundColor = "#555";
                btn.disabled = true;
            } else {
                // Check if they can afford
                let canAfford = true;
                let tempWeapons = [...state.stash.weapons];
                let tempTC = [...state.stash.tools, ...state.stash.consumables];

                for (let w of deal.giveW) {
                    let i = tempWeapons.indexOf(w);
                    if (i === -1) { canAfford = false; break; }
                    tempWeapons.splice(i, 1);
                }
                if (canAfford) {
                    for (let tc of deal.giveTC) {
                        let i = tempTC.indexOf(tc);
                        if (i === -1) { canAfford = false; break; }
                        tempTC.splice(i, 1);
                    }
                }

                if (!canAfford) {
                    btn.textContent = "Cannot Afford";
                    btn.style.backgroundColor = "#8b0000";
                    btn.disabled = true;
                } else {
                    btn.onclick = () => {
                        // Process trade
                        deal.giveW.forEach(w => state.stash.weapons.splice(state.stash.weapons.indexOf(w), 1));
                        deal.giveTC.forEach(tc => {
                            let idx = state.stash.tools.indexOf(tc);
                            if (idx !== -1) state.stash.tools.splice(idx, 1);
                            else state.stash.consumables.splice(state.stash.consumables.indexOf(tc), 1);
                        });

                        deal.recW.forEach(w => state.stash.weapons.push(w));
                        deal.recTC.forEach(tc => {
                            if (allTools.includes(tc)) state.stash.tools.push(tc);
                            else state.stash.consumables.push(tc);
                        });

                        deal.available = false;
                        saveState();
                        renderAll();
                    };
                }
            }
        });

        let advBtn = document.createElement("button");
        advBtn.textContent = "Leave Trader (Advance)";
        advBtn.onclick = () => advanceNode();
        nodeActionsEl.appendChild(advBtn);

    } else if (n % 3 === 0) { // MISSION NODE
        let isBoss = (n === 15);
        let mIndex = Math.floor(n / 3) - 1;

        nodeTitleEl.textContent = isBoss ? `Node 15: FINAL BOSS` : `Node ${n}: Mission`;

        let html = `<p><strong>${missions[mIndex]}</strong></p>`;
        if (isBoss) {
            html += `<p style="color:red; font-weight:bold;">${debuffs[Math.floor(Math.random() * debuffs.length)]}</p>`;
        }
        html += `<p>Play your match. Did you complete the mission?</p>`;

        nodeContentEl.innerHTML = html;

        let successBtn = document.createElement("button");
        successBtn.textContent = "Mission Success (Advance)";
        successBtn.style.backgroundColor = "#4dff4d";
        successBtn.style.color = "#000";
        successBtn.onclick = () => advanceNode();

        let failBtn = document.createElement("button");
        failBtn.textContent = "Mission Failed (+1 Strike)";
        failBtn.className = "danger-btn";
        failBtn.onclick = () => window.gainStrike();

        nodeActionsEl.appendChild(successBtn);
        nodeActionsEl.appendChild(failBtn);
    }
}

resetBtn.onclick = () => {
    if (confirm("Are you sure you want to abandon the current run? All progress and stash items will be lost forever.")) {
        startNewRun();
        renderAll();
    }
};
