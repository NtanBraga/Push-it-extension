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
        zIndex: '2147483647',
        display: 'none'
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
        .konvajs-content, konvajs-content canvas {
            pointer-events: auto;
        }
    `

    const mount = document.createElement('div')
    mount.id = 'push-it-app'

    shadow.append(style, mount)
    document.body.appendChild(host)

    const app = createApp(LoadSticky);
    app.use(VueKonva);
    app.mount(mount); 


    //controle de visibilidade

    const setEnabled = (enabled: boolean) => {
        host.style.display = enabled ? 'block' : 'none'
    }

    chrome.storage.local.get({pushItEnabled: true}).then((data) => {
        setEnabled(data.pushItEnabled as boolean)
    }).catch((e) => {
        console.error("Erro ao ler estado: ", e)
        setEnabled(true)
    })

    //alterações no popup
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if(areaName !== 'local') return
        if(changes.pushItEnabled) setEnabled(changes.pushItEnabled.newValue === true)
    })

};

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
        once: true
    })
}else {
    init()
}