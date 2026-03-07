import { defineComponent, type PropType, ref, shallowRef, watch } from "vue";
import { Group, Rect, Transformer } from "vue-konva";
import { EditText } from "./EditText";

export const StickyNote = defineComponent({
    name: 'StickyNote',

    props: {
        id: { type: [String, Number], required: true },
        text: { type:String, required: true },
        colour: { type: String, default: 'yellow' },
        fontFamily: { type: String, default: 'sans-serif'},
        fontColour: { type: String, default: 'black' },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },   
        selected: { type: Boolean, default: false },
        onClick: { type: Function as PropType<(e: any) => void>, default: () => {} },
        onTextChange: { type: Function as PropType<(newText: string) => void>, required: true},
        OnTextClick: { type: Function as PropType<(editing: boolean) => void>, default: () => {} },
        onResize: { type: Function as PropType<(w: number, h: number) => void>, required: true },
        onDragEnd: { type: Function as PropType<(newX: number, newY: number) => void>, required: true},
        onDragMove: { type: Function as PropType<(e: any) => void>, default: () => {} },
        idConnect: { type: Array, default: () => [] },
    },

    setup(props) {
        const isEditing = ref(false);
        const isDragging = ref(false);

        const groupRef = shallowRef<any>(null);
        const transformerRef = shallowRef<any>(null);

        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 900;
        const MIN_SIZE = 100;

        watch(
            () => props.selected,
            (sel) => {
                if(!sel && isEditing.value) {
                    isEditing.value = false;
                }
            }
        )

        watch(
            () => props.selected,
            (sel) => {
                if(sel && transformerRef.value && groupRef.value) {
                    transformerRef.value.nodes([groupRef.value])
                    transformerRef.value.getLayer()?.batchDraw()
                }else if(transformerRef.value) {
                    transformerRef.value.nodes([]);
                }
            },
            {immediate: true}
        )
        const toggleEdit = () => {
            if(!isDragging.value) {
                isEditing.value = !isEditing.value
                props.OnTextClick(isEditing.value)
            }
        }
        const handleDragStart = () => {
            isDragging.value = true;
            isEditing.value = false;
        }
        const handleDragEnd = (e: any) => {
            isDragging.value = false
            props.onDragEnd(e.target.x(), e.target.y())
        }
        const handleTransformEnd = () => {
            if(!groupRef.value) return;

            const node = groupRef.value
            const tr = transformerRef.value

            const scaleX = node.scaleX()
            const scaleY = node.scaleY()

            node.scaleX(1)
            node.scaleY(1)

            let newWidth = Math.max(MIN_SIZE, Math.min(MAX_WIDTH, props.width * scaleX))
            let newHeight = Math.max(MIN_SIZE, Math.min(MAX_HEIGHT, props.height * scaleY))

            newWidth = Math.round(newWidth)
            newHeight = Math.round(newHeight)

            props.onResize(newWidth, newHeight)

            if(tr) {
                tr.nodes([node])
                tr.getLayer()?.batchDraw()
            }
        }
        return () => (
            <>
                <Group config={{
                    ref: groupRef,
                    x: props.x,
                    y: props.y,
                    draggable: !isEditing.value,
                    onDragstart: handleDragStart,
                    onDragend: handleDragEnd,
                    onDragmove: (e:any) => props.onDragMove?.(e),
                    onClick: props.onClick,
                    onTap: props.onClick,
                    onTransformed: handleTransformEnd
                }}
                >
                    <Rect config={{
                        x: 20,
                        y: 20,
                        width: props.width,
                        height: props.height + 40,
                        fill: props.colour,
                        shadowColor: 'black',
                        shadowOffsetX: 0,
                        shadowOffsetY: 10,
                        shadowBlur: 30,
                        shadowOpacity: 0.6,
                        perfectDrawEnabled: false,
                    }}
                    />
                    <Rect config={{
                        x: 0,
                        y: 0,
                        width: props.width + 40,
                        height: props.height + 60,
                        fill: props.colour,
                        perfectDrawEnabled: false,
                        onClick: props.onClick,
                        onTap: props.onClick
                    }}
                    />
                    <EditText
                        x={20}
                        y={20}
                        width={props.width}
                        height={props.height + 40}
                        text={props.text}
                        fontFamily={props.fontFamily}
                        fontColour={props.fontColour}
                        isEditing={isEditing.value}
                        onToggleEdit={toggleEdit}
                        onChange={props.onTextChange}
                    />
                </Group>
                {props.selected && !isEditing.value && (
                    <Transformer
                        ref={transformerRef}
                        config={{
                            boundBoxFunc: (oldBox: any, newBox: any) => {
                                if(newBox.width < MIN_SIZE || newBox.height < MIN_SIZE){
                                    return oldBox
                                }
                                return newBox
                            },
                            rotateEnabled: false,
                        }}
                    />
                )}
            </>
        )
    },
}) 