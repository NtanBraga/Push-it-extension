<script setup lang="ts">
import { StickyNote } from './Stickynotes/Stickynote.tsx';
import { ref, onMounted} from 'vue'
import type Konva from 'konva'

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

const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if(e.target === e.target.getStage()){
        selectedId.value = null
    }
}

onMounted(() => {

    window.addEventListener('resize', () => {
        stageConfig.value.width = window.innerWidth;
        stageConfig.value.height = window.innerHeight;
    })

    window.addEventListener('mousedown', (e) => {
        const path = e.composedPath()

        const clickedEditorOrCanvas = path.some((element) => 
            element instanceof HTMLCanvasElement || element instanceof HTMLTextAreaElement
        )

        if(!clickedEditorOrCanvas) selectedId.value = null
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
    <v-stage :config="stageConfig" @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
        <v-layer>
            <StickyNote
                v-for="note in notes"
                :key="note.id"
                v-bind="note"
                :selected="note.id === selectedId"
                :onClick="() => selectedId = note.id"
                @text-change="(text) => note.text = text"
                @resize="(w, h, x, y) => { note.width = w; note.height = h; note.x = x; note.y = y }"
                @drag-end="(x, y) => { note.x = x; note.y = y }"
            />
        </v-layer>
    </v-stage>
</template>