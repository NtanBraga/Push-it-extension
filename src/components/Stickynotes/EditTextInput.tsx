import { defineComponent, nextTick, onMounted, ref, type PropType } from 'vue'
import { Html } from '../vue-konva-util/html.tsx'

export const EditTextInput = defineComponent({
    name: 'EditTextInput',

    props: {
        x: { type: Number, required: true},
        y: { type: Number, required: true},
        width: { type: Number, required: true},
        height: { type: Number, required: true},
        fontFamily: { type: String, required: true},
        value: { type: String, default: ''},
        onChange: { type: Function as PropType<(val: string) => void>, required: true },
        onKeydown: { type: Function as PropType<(e: KeyboardEvent) => void>, default: () => {}},
        autoFocus: { type: Boolean, default: true},
    },

    setup(props) {
        const textareaRef = ref<HTMLTextAreaElement | null>(null)

        onMounted(() => {
            nextTick(() => {
                textareaRef.value?.focus()
            })
        })

        const handleInput = (e: Event) => {
            const target = e.target as HTMLTextAreaElement
            props.onChange(target.value)
        }

        const handleKeydown = (e: KeyboardEvent) => {
            props.onKeydown(e)
            if(e.key ==='Enter' && !e.shiftKey) {
                e.preventDefault()
            }
            if(e.key === 'Escape') {
                e.preventDefault()
            }
        }

        const textareaStyle = {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            border: 'none',
            padding: '4px 8px',
            margin: '0',
            background: 'transparent',
            outline: 'none',
            resize: 'none',
            color: 'black',
            fontSize: '24px',
            fontFamily: props.fontFamily || 'sans-serif',
            lineHeight: '1.4',
            boxSizing: 'border-box' as const,
            caretColor: 'black',
        } as const

        return () => (
            <Html
                groupProps={{
                    x:props.x,
                    y:props.y,
                }}
                divProps={{
                    style: {
                        width: `${props.width}px`,
                        height: `${props.height}px`,
                        pointerEvents: 'auto',
                    }
                }}
            >
                <textarea
                    ref={textareaRef}
                    value={props.value}
                    onInput={handleInput}
                    onKeydown={handleKeydown}
                    style={textareaStyle}
                />
            </Html>
        )
    },
})