import { defineComponent, type PropType } from 'vue'
import { Text } from 'vue-konva'

export const ResizableText = defineComponent({
    name: 'ResizableText',

    props: {
        x: { type: Number, required:true },
        y: { type: Number, required:true },
        text: { type: String, default: '' },
        fontColour: { type: String, default: 'black' },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        onDoubleClick: { type: Function as PropType<(e: MouseEvent) => void>,default: () => {}},
    },

    setup(props) {
        return () => (
            <Text
                config={{
                    x: props.x,
                    y: props.y,
                    text: props.text,
                    fill: props.fontColour,
                    fontFamily: "sans-serif",
                    fontSize: 24,
                    perfectDrawEnabled: false,
                    listening: true,
                    width: props.width,
                    height: props.height,
                    wrap: "word",
                    align: "left",
                    ellipsis: true,
                    lineHeight: 1.2,
                    onDblClick: props.onDoubleClick,
                    onDblTap: props.onDoubleClick,
                }}
                
            />
        )
    }
})