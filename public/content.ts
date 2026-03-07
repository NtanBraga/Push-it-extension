import { createApp } from 'vue';
import VueKonva from 'vue-konva';
import LoadSticky from '../src/components/LoadSticky.vue';

console.log("Ouvinte de notas ativado!");

chrome.runtime.onMessage.addListener((message) => {
    if(message.action === "ADD_NOTE") {
        console.log("Sucesso! Dados recebidos: ", message.data);

        alert("Nota criada! Cor:" + message.data.colour)
    }
})

const init = () => {
    const container = document.createElement('div');
    container.id = 'sticky-notes-root';
    document.body.appendChild(container)

    const app = createApp(LoadSticky);
    app.use(VueKonva);
    app.mount('#sticky-notes-root'); 
};

if(document.readyState === 'complete') {
    init();
}else {
    window.addEventListener('load', init);
}