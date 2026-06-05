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

sliderElement.oninput = function() {
    displayElement.textContent = this.value;
    max_slot = this.value;
}

function setupData(data)
{
    weaponData = data;

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

    setupData(allData)

    max_slot = parseInt(max_slot)

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
};