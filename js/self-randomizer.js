const sliderElement = document.getElementById("slotSlider");
const displayElement = document.getElementById("slotDisplay");
const randomizeButton = document.getElementById("randomizeButton");

const weapon1Img = document.getElementById("weapon1Img");
const weapon2Img = document.getElementById("weapon2Img");
const weaponNameDisplay1 = document.getElementById("weaponNameDisplay1");
const weaponNameDisplay2 = document.getElementById("weaponNameDisplay2");

const DuelText1 = document.getElementById("duelText1");
const DuelText2 = document.getElementById("duelText2");

const variantCheckbox = document.getElementById('variantCheckbox');

let weaponData = null;
let allData = null;
let max_slot = 5;
let weapons5 = null;
let weapons4 = null;
let weapons3 = null;
let weapons2 = null;
let weapons1 = null;

let toolsData = null;

let baseOnly = false;

fetch('data/weapons.json')
.then(function(response) {
    return response.json(); 
})
.then(function(myData) {
    allData = myData;
})
.catch(function(error) {
    console.error("Oops, something went wrong:", error);
});

fetch('data/tools_consumables.json')
.then(function(response) {
    return response.json(); 
})
.then(function(myData) {
    toolsData = myData;
})
.catch(function(error) {
    console.error("Oops, something went wrong with tools:", error);
});

sliderElement.oninput = function() {
    displayElement.textContent = this.value;
    max_slot = this.value;
}

function setupData(data)
{
    weaponData = JSON.parse(JSON.stringify(data));

    if(baseOnly)
    {
        for (i=0; i<5; i++)
        {
            weaponData[i].weapons = weaponData[i].weapons.filter(weaponObj => weaponObj.base == 1);      
        }
    }

    weapons5 = [...weaponData[0].weapons, ...weaponData[1].weapons,...weaponData[2].weapons,...weaponData[3].weapons,...weaponData[4].weapons];
    weapons4 = [...weaponData[0].weapons, ...weaponData[1].weapons,...weaponData[2].weapons,...weaponData[3].weapons];
    weapons3 = [...weaponData[0].weapons, ...weaponData[1].weapons,...weaponData[2].weapons];
    weapons2 = [...weaponData[0].weapons, ...weaponData[1].weapons];
    weapons1 = [...weaponData[0].weapons];
}

function getPool(max_slot)
{
    switch(max_slot)
    {
        case 1:
            return weapons1;
        case 2:
            return weapons2;
        case 3:
            return weapons3;
        case 4:
            return weapons4;
        case 5:
            return weapons5;
        default:
            return weapons5;
    }
}

randomizeButton.onclick = function() {

    if (variantCheckbox.checked)
    {
        baseOnly = false;
    }else
    {
        baseOnly = true;
    }

    setupData(allData);

    console.log(weaponData);
    console.log(allData);

    max_slot = parseInt(max_slot);

    let weaponPool = null;

    weaponPool = getPool(max_slot);

    let randomIndex = Math.floor(Math.random() * weaponPool.length); 
    let weapon1 = weaponPool[randomIndex];
    let weapon1Name = weapon1.weapon;
    let weapon1Slot = weapon1.slot;
    let weapon2Slot = max_slot - weapon1Slot;

    let weapon2 = null;

    if(weapon2Slot <= 0)
    {
        weapon2 = {"weapon":"empty"};
    }else
    {
        weaponPool = weaponData[weapon2Slot-1].weapons;

        randomIndex = Math.floor(Math.random() * weaponPool.length); 
        weapon2 = weaponPool[randomIndex];     
    }
    let weapon2Name = weapon2.weapon;

    let weapon1PicName = weapon1Name;
    let weapon2PicName = weapon2Name;

    DuelText1.textContent = "";
    DuelText2.textContent = "";

    if(weapon1PicName.endsWith("_duel"))
    {
        weapon1PicName = weapon1PicName.slice(0,-5);
        DuelText1.textContent = "x2";
    }
    if(weapon2PicName.endsWith("_duel"))
    {
        weapon2PicName = weapon2PicName.slice(0,-5);
        DuelText2.textContent = "x2";
    }

    weapon1Img.innerHTML = '<img src="' + "images/weapons/" + weapon1PicName + '.png' + '" alt="'+weapon1Name + '" title="' +weapon1Name + '">';
    weapon2Img.innerHTML = '<img src="' + "images/weapons/" + weapon2PicName + '.png' + '" alt="'+weapon2Name + '" title="' +weapon2Name + '">';

    weaponNameDisplay1.textContent = weapon1Name + " ("+weapon1Slot+")";
    weaponNameDisplay2.textContent = weapon2Name + " ("+weapon2Slot+")";

    // Randomize Tools and Consumables
    if (toolsData) {
        let melees = toolsData.tools[0].melees;
        let firstAid = toolsData.tools[0].first_aid;
        let others = toolsData.tools[0].others;
        let shots = toolsData.consumables.shots;
        let throwables = toolsData.consumables.throwables;
        let placeables = toolsData.consumables.placeables;

        let restPool = [...others, ...shots, ...throwables, ...placeables];

        let slot1 = melees[Math.floor(Math.random() * melees.length)];
        let slot2 = firstAid[0]; // Guarantee first_aid_kit
        
        let toolImages = document.querySelectorAll('.tool-slot img');
        
        if (toolImages.length >= 8) {
            // Update slot 1 (Melee)
            toolImages[0].src = "images/tools_consumables/" + slot1 + ".png";
            toolImages[0].alt = slot1;
            toolImages[0].title = slot1;

            // Update slot 2 (Medkit)
            toolImages[1].src = "images/tools_consumables/" + slot2 + ".png";
            toolImages[1].alt = slot2;
            toolImages[1].title = slot2;

            // Update slots 3 to 8
            for (let i = 2; i < 8; i++) {
                let randomIndex = Math.floor(Math.random() * restPool.length);
                let randomItem = restPool[randomIndex];
                
                // Prevent unique tools from repeating by removing them from the pool
                if (others.includes(randomItem)) {
                    restPool.splice(randomIndex, 1);
                }

                toolImages[i].src = "images/tools_consumables/" + randomItem + ".png";
                toolImages[i].alt = randomItem;
                toolImages[i].title = randomItem;
            }
        }
    }
};