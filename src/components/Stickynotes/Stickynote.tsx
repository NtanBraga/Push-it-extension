import { defineComponent, type PropType, ref, shallowRef, watch, nextTick, computed } from "vue";
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
        onResize: { type: Function as PropType<(w: number, h: number , x: number, y: number) => void>, required: true },
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

        const BASE_WIDTH = 250
        const BASE_HEIGHT = 230
        const BASE_FONT_SIZE = 24

        const fontSize = computed(() => {
            const widthScale = props.width / BASE_WIDTH
            const heightScale = props.height / BASE_HEIGHT

            const scale = Math.sqrt(widthScale * heightScale)
            const size = BASE_FONT_SIZE * scale

            return Math.round(Math.max(12, Math.min(54, size)))
        })

        const stopEdit = () => {
            if(!isEditing.value) return

            isEditing.value = false
            props.OnTextClick(false)
        }
        const toggleEdit = () => {
            if(isDragging.value) return

            if(isEditing.value) {
                stopEdit()
            }else{
                isEditing.value = true
                props.OnTextClick(true)
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
            const node = groupRef.value?.getNode?.()

            if(!node) return

            const scaleX = node.scaleX()
            const scaleY = node.scaleY()

            const newWidth = Math.round(Math.max(MIN_SIZE,Math.min(MAX_WIDTH,(props.width + 40) * scaleX - 40)))
            const newHeight = Math.round(Math.max(MIN_SIZE, Math.min(MAX_HEIGHT,(props.height + 60) * scaleY - 60)))
        
        
            const newX = Math.round(node.x())
            const newY = Math.round(node.y())

            node.scaleX(1)
            node.scaleY(1)
        
            props.onResize(newWidth, newHeight, newX, newY)

            nextTick(() => {
                const transformer = transformerRef.value?.getNode?.()

                transformer?.forceUpdate()
                transformer?.getLayer()?.batchDraw()
            })
        }


        watch(
            () => props.selected,
            (sel) => {
                if(!sel) {
                    stopEdit()
                }
            }
        )

        watch(
            [() => props.selected, isEditing],

            async([selected, editing]) => {
                await nextTick()

                const group = groupRef.value?.getNode?.()
                const transformer = transformerRef.value?.getNode?.()

                if(!transformer) return
                
                if(selected && !editing && group){
                    transformer.nodes([group])
                }else{
                    transformer.nodes([])
                }

                transformer.getLayer()?.batchDraw()
            },{
                immediate: true,
                flush: 'post'
            }
        )


        return () => (
            <>
                <Group ref = {groupRef} config={{
                    
                    x: props.x,
                    y: props.y,
                    draggable: !isEditing.value,
                    listening: true,
                    onDragstart: handleDragStart,
                    onDragend: handleDragEnd,
                    onDragmove: (e:any) => props.onDragMove?.(e),
                    onClick: props.onClick,
                    onTap: props.onClick,
                    onTransformend: handleTransformEnd,

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
                        fontSize={fontSize.value}
                        isEditing={isEditing.value}
                        onToggleEdit={toggleEdit}
                        onEndEdit={stopEdit}
                        onChange={props.onTextChange}
                    />
                </Group>
                {props.selected && !isEditing.value && (
                    <Transformer
                        ref={transformerRef}
                        config={{
                            rotateEnabled: false,
                            flipEnabled: false,
                            keepRatio: false,

                            boundBoxFunc: (oldBox: any, newBox: any) => {
                                if(
                                    newBox.width < MIN_SIZE + 40 ||
                                    newBox.height < MIN_SIZE + 60 ||
                                    newBox.width > MAX_WIDTH + 40 ||
                                    newBox.height > MAX_HEIGHT +60
                                ){
                                    return oldBox
                                }
                                return newBox
                            }
                        }}
                    />
                )}
            </>
        )
    },
}) 