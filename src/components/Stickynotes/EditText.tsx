import { defineComponent, type PropType } from "vue";
import { EditTextInput } from "./EditTextInput.tsx";
import { ResizableText } from "./ResizableText.tsx";

const RETURN_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';

export const EditText = defineComponent({
    name: 'EditText',

    props: {
        x: { type: Number, required: true},
        y: { type: Number, required: true},
        text: { type: String, default: ''},
        fontColour: { type: String, default: 'black'},
        fontFamily: { type: String, default: 'sans-serif'},
        width: { type: Number, required: true },
        height: { type: Number, required: true},
        isEditing: { type: Boolean, required: true},
        onToggleEdit: { type: Function as PropType<() => void>, required: true},
        onChange:{ type: Function as PropType<(val: string) => void>, required: true },
    },

    setup(props) {
        const handleEscapeKeys = (e: KeyboardEvent) => {
            if((e.key === RETURN_KEY && !e.shiftKey) || e.key === ESCAPE_KEY) {
                e.preventDefault();
                props.onToggleEdit;
            }
        }
        const handleTextChange = (newValue: string) => {
            props.onChange(newValue)
        }
        return () => {
            if(props.isEditing){
                return (
                    <EditTextInput
                        x={props.x}
                        y={props.y}
                        width={props.width}
                        height={props.height}
                        fontFamily={props.fontFamily}
                        value={props.text}
                        onChange={handleTextChange}
                        onKeydown={handleEscapeKeys}
                    />
                )
            }
            return (
                <ResizableText
                    x={props.x}
                    y={props.y}
                    width={props.width}
                    height={props.height}
                    text={props.text}
                    fontColour={props.fontColour}
                    onDoubleClick={props.onToggleEdit}
                />
            )
        }
    },
})