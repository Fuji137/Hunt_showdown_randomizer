const displayElement = document.getElementById("slotDisplay");
const randomizeButton = document.getElementById("randomizeButton");

const weaponImg = document.getElementById("weaponImg");
const weaponsName = document.getElementById("weaponsName");

const duelText = document.getElementById("duelText");

const variantCheckbox = document.getElementById('variantCheckbox');

let baseData = null;
let allData = null;

let baseOnly = false;

fetch('data/weapons.json')
.then(function(response) {
    return response.json(); 
})
.then(function(myData) {
    allData = JSON.parse(JSON.stringify(myData));
    weaponData = JSON.parse(JSON.stringify(myData));
    for (i=0; i<5; i++)
    {
        weaponData[i].weapons = weaponData[i].weapons.filter(weaponObj => weaponObj.base == 1);      
    }
})
.catch(function(error) {
    console.error("Oops, something went wrong:", error);
});

randomizeButton.onclick = function() {

    if (variantCheckbox.checked)
    {
        baseOnly = false;
    }else
    {
        baseOnly = true;
    }

    

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