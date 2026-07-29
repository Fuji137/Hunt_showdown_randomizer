const randomizeButton = document.getElementById("randomizeButton");

const weaponImgs = document.querySelectorAll("#weaponsImg .image-slot");
const toolImgs = document.querySelectorAll(".tool-slot img");
const toolSlots = document.querySelectorAll(".tool-slot");
const variantCheckbox = document.getElementById('variantCheckbox');

let weaponData = null;
let toolsData = null;

// Fetch data
Promise.all([
    fetch('data/weapons.json').then(res => res.json()),
    fetch('data/tools_consumables.json').then(res => res.json())
]).then(([weapons, tools]) => {
    weaponData = weapons;
    toolsData = tools;
}).catch(error => {
    console.error("Error loading data:", error);
});

// Helper to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

randomizeButton.onclick = function() {
    if (!weaponData || !toolsData) return;

    // Reset draft marks
    document.querySelectorAll(".player1-mark, .player2-mark, .player3-mark").forEach(el => {
        el.classList.remove("player1-mark", "player2-mark", "player3-mark");
    });

    // 1. Generate 9 Weapons
    let baseOnly = !variantCheckbox.checked;
    
    let allWeapons = [];
    weaponData.forEach(slotData => {
        let weaponsToAdd = slotData.weapons;
        if (baseOnly) {
            weaponsToAdd = weaponsToAdd.filter(w => w.base === 1);
        }
        allWeapons = allWeapons.concat(weaponsToAdd);
    });

    for (let i = 0; i < 9; i++) {
        let randomWeapon = allWeapons[Math.floor(Math.random() * allWeapons.length)];
        let wName = randomWeapon.weapon;
        
        let picName = wName;
        if(picName.endsWith("_duel")) {
            picName = picName.slice(0, -5);
        }

        weaponImgs[i].innerHTML = '<img src="images/weapons/' + picName + '.png" alt="'+wName+'" title="'+wName+'">';
    }

    // 2. Generate 30 Tools/Consumables (Exactly 3 medkits)
    let melees = toolsData.tools[0].melees;
    let others = toolsData.tools[0].others;
    let shots = toolsData.consumables.shots;
    let throwables = toolsData.consumables.throwables;
    let placeables = toolsData.consumables.placeables;

    let combinedPool = [...melees, ...others, ...shots, ...throwables, ...placeables];
    let selectedTools = [];

    // Force exactly 3 medkits
    selectedTools.push("first_aid_kit", "first_aid_kit", "first_aid_kit");

    // Randomize the remaining 27
    for (let i = 0; i < 27; i++) {
        let randomTool = combinedPool[Math.floor(Math.random() * combinedPool.length)];
        selectedTools.push(randomTool);
    }

    // Shuffle so medkits aren't always the first 3
    shuffleArray(selectedTools);

    // Render to UI
    for (let i = 0; i < 30; i++) {
        toolImgs[i].src = "images/tools_consumables/" + selectedTools[i] + ".png";
        toolImgs[i].alt = selectedTools[i];
        toolImgs[i].title = selectedTools[i];
    }
};

// 3. Draft Interaction (Click to Mark)
const states = ["", "player1-mark", "player2-mark", "player3-mark"];

function cycleDraftState(element) {
    let currentState = 0;
    if (element.classList.contains("player1-mark")) currentState = 1;
    else if (element.classList.contains("player2-mark")) currentState = 2;
    else if (element.classList.contains("player3-mark")) currentState = 3;

    // Remove current state class if any
    if (currentState > 0) {
        element.classList.remove(states[currentState]);
    }

    // Move to next state
    let nextState = (currentState + 1) % states.length;
    
    // Add next state class if not empty
    if (nextState > 0) {
        element.classList.add(states[nextState]);
    }
}

// Add listeners to weapon slots
weaponImgs.forEach(slot => {
    slot.addEventListener("click", function() {
        cycleDraftState(this);
    });
});

// Add listeners to tool slots
toolSlots.forEach(slot => {
    slot.addEventListener("click", function() {
        cycleDraftState(this);
    });
});