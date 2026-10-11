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

    if(document.getElementById("push-it-root")) return

    const host = document.createElement("div")
    host.id = "push-it-root"

    Object.assign(host.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents : 'none',
        zIndex: '2147483647'
    })

    //shadow-dom
    const shadow = host.attachShadow({mode: 'open'})

    const style = document.createElement('style')
    style.textContent = 
    `
        :host {
            all: initial;
            position: fixed;
            inset: 0;
            z-index: 200;
            pointer-event: none;
        }
        #push-it-app {
            width: 100%;
            height: 100%;
        }
    `

    const mount = document.createElement('div')
    mount.id = 'push-it-app'

    shadow.append(style, mount)
    document.body.appendChild(host)

    const app = createApp(LoadSticky);
    app.use(VueKonva);
    app.mount(mount); 
};

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
        once: true
    })
}else {
    init()
}