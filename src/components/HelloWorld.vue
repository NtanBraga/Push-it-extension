<script setup lang="ts">
import { onMounted, ref } from 'vue'
import iro from '@jaames/iro'


const isEnabledExtention = ref<boolean>(true)
const isLoadingExtention = ref<boolean>(true)

const color = ref("#fef08a");
const selectedFont = ref("Inter");

const createSticky = async() => {

  if(!isEnabledExtention.value || isLoadingExtention.value) return

  const [page] = await chrome.tabs.query({ active: true, currentWindow: true});

  if(page?.id) {
    chrome.tabs.sendMessage(page.id, {
      action: "ADD_NOTE",
      data: {
        id: Date.now().toString(),
        x: 20,
        y:20,
        width: 250,
        height: 230,
        text: "Inserir texto",
        selected: false,
        colour: color.value,
        font: selectedFont.value,

      }
    })
  }
}

const toggleExtention = async () => {
  const newValue = isEnabledExtention.value

  try{
    await chrome.storage.local.set({pushItEnabled: newValue})

    console.log("A extensão está: ", newValue ? 'ativada' : 'desativada')
  }catch(e){
    isEnabledExtention.value = !newValue
    console.error("Erro ao atualizar estado: ", e)
  }
}

onMounted(async () => {
  try{
    const data = await chrome.storage.local.get({pushItEnabled: true})
    isEnabledExtention.value = data.pushItEnabled as boolean
  }catch(e){
    console.error("Erro ao carregar estado: ", e)
  }finally{
    isLoadingExtention.value = false
  }
})

onMounted(() => {
  const colorPicker = new (iro as any).ColorPicker("#picker", {
    width: 180,
    color: color.value,
    layout: [
      {
        component: (iro as any).ui.Wheel,
        options: { borderColor: '#ffffff', borderWidth: 2 }
      },
    ]
  });
  colorPicker.on('color:change', (newColor: any) => {
    color.value = newColor.hexString;
  });
});

</script>

<template>

<div class="extension-container">
  <div class="input-group">
      <span>Ativar: </span>
      <div class="slide-checkbox">
          <label class="switch">
              <input type="checkbox" v-model="isEnabledExtention" @change="toggleExtention" :disabled="isLoadingExtention">
              <span class="slider"></span>
          </label>
      </div>
  </div>
  <div class="font-selector-container">
    <label class="font-label ">Estilo da fonte</label>
    <select v-model="selectedFont" class="font-dropdown">
      <option style="font-family: 'Gochi Hand', cursive;">Caligrafia</option>
      <option style="font-family: 'Inter', sans-serif;">Padrão Moderno</option>
      <option style="font-family: 'Courier New', monospace;">Máquina de Escrever</option>
      <option style="font-family: 'Permanent Marker', cursive;">Pincel Atômico</option>
    </select>

    <div class="picker-section">
      <div id="picker"></div> <div class="hex-display">
        {{ color }}
      </div>
    </div>
  </div>


  <button @click="createSticky" :disabled="!isEnabledExtention || isLoadingExtention" class="btn-create">
    +Criar Sticknote
  </button>

  <div class="input-group">
      <span>Bloquear página: </span>
      <div class="slide-checkbox">
          <label class="switch">
              <input class="checkbox" type="checkbox">
              <span class="slider"></span>
          </label>
      </div>
  </div>


  <div class="footer-nav">
    <div class="workspace-group">
      <button class="btn-workspace">
        <span>🏠</span> Home
      </button>
      <button class="btn-add-workspace">+</button>
    </div>

    <button class="btn-settings">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    </button>
  </div>
</div>
</template>

<style scoped>
</style>
