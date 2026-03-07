<script setup lang="ts">
import { StickyNote } from './Stickynotes/Stickynote';
import { ref, onMounted} from 'vue'

const notes = ref<any[]>([])
const selectedId = ref<string | null>(null);

const stageConfig ={
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex:Number.MAX_SAFE_INTEGER
    }
}
const handleMouseDown = (e: any) => {
    if(e.target === e.target.getStage()) {
        selectedId.value = null;
    }
}

onMounted(() => {
    chrome.runtime.onMessage.addListener((message) => {
        if(message.action === "ADD_NOTE") {
            notes.value.push({ ...message.data, selected: true})
        }
        selectedId.value = message.data.id;
    })
})

</script>

<template>
    <v-stage :config="stageConfig" @mousedown="handleMouseDown">
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