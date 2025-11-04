
// function toSettingsPage(){
//     window.location.href = 'settings.html';
// }

const controlContainer = document.querySelector(".segmented-control");
const selectionMessage = document.getElementById("selectionMessage");

function updateSelectionMessage(value) {
    selectionMessage.innerHTML = `Selected: <span class="highlight">${value.charAt(0).toUpperCase() + value.slice(1)
        }</span>`;
}

controlContainer.addEventListener("change", (event) => {
    if (event.target.name === "environment") {
        updateSelectionMessage(event.target.value);
    }
});

window.onload = () => {
    const checkedRadio = document.querySelector(
        'input[name="environment"]:checked'
    );
    if (checkedRadio) {
        updateSelectionMessage(checkedRadio.value);
    }
};
