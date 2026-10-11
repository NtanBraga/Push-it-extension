<script setup lang="ts">
import { StickyNote } from './Stickynotes/Stickynote.tsx';
import { ref, onMounted} from 'vue'

const notes = ref<any[]>([])
const selectedId = ref<string | null>(null);

const stageConfig = ref({
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex:'2147483647',
    }
})


onMounted(() => {

    window.addEventListener('resize', () => {
        stageConfig.value.width = window.innerWidth;
        stageConfig.value.height = window.innerHeight;
    })

    window.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement;

        if(target.tagName !== 'CANVAS' && target.tagName !== 'TEXTAREA') {
            selectedId.value = null;
        }
    });

    chrome.runtime.onMessage.addListener((message) => {
        if(message.action === "ADD_NOTE") {
            notes.value.push({ ...message.data, selected: true})
            selectedId.value = message.data.id;
        }
    })
})

</script>

<template>
    <v-stage :config="stageConfig">
        <v-layer>
            <StickyNote
                v-for="note in notes"
                :key="note.id"
                v-bind="note"
                :selected="note.id === selectedId"
                @onClick="() => selectedId = note.id"
                @text-change="(text) => note.text = text"
                @resize="(w, h) => { note.width = w; note.height = h }"
                @drag-end="(x, y) => { note.x = x; note.y = y }"
            />
        </v-layer>
    </v-stage>
</template>