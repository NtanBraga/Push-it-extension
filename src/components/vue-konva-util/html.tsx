import { defineComponent, shallowRef, ref, onMounted, nextTick, watch, h, onUnmounted, Teleport } from "vue"
import { Group } from "vue-konva"

interface DecomposedTransform {
    x:number,
    y:number,
    rotation:number,
    scaleX:number,
    scaleY:number
}

export interface HtmlProps {
    groupProps?: Record<string,any>
    divProps?: Partial<HTMLDivElement>
    transform?: boolean
    transformFunc?: (attrs: DecomposedTransform) => DecomposedTransform
    parentNodeFunc?: (payload: {stage: any}) => HTMLElement | null | undefined
}

export const Html = defineComponent({
    name: 'Html',
    props: {
        groupProps: {type:Object, default: () => ({})},
        divProps: {type:Object, default: () => ({})},
        transform: {type:Boolean, default: true},
        transformFunc: {type:Function, default: undefined},
        parentNodeFunc: {type:Function, default: undefined},
    },

    setup(props, {slots}){
        const groupRef = shallowRef<any>(null)
        const ready = ref(false)

        //teleport
        const div = document.createElement('div');
        let konvaGroup: any = null

        const handleTransform = () => {
            if(!konvaGroup) return
            
            if(!props.transform) {
                const transform = konvaGroup.getAbsoluteTransform()
                let attrs = transform.decompose() as DecomposedTransform

                if(props.transformFunc) attrs = props.transformFunc(attrs)

                Object.assign(div.style, {
                    position: 'absolute',
                    zIndex: '10',
                    top: '0px',
                    left: '0px',
                    transform: `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`,
                    transformOrigin: 'top left',
                })
            }

            

            const { style, ...rest } = props.divProps as Record<string, any>
            if (style) Object.assign(div.style, style) 
            Object.assign(div, rest)
        }

        onMounted(async () => {
            await nextTick()

            //konva só entrega o node via getNode
            konvaGroup = groupRef.value?.getNode?.()

            if(!konvaGroup) return

            const stage = konvaGroup.getStage()
            if(!stage) return

            const parent = props.parentNodeFunc 
                ? props.parentNodeFunc({ stage })
                : stage.getContent()

            if(!parent) return

            parent.appendChild(div)

            konvaGroup.on('absoluteTranformChange', handleTransform)

            handleTransform()

            ready.value = true
        })

        watch(
            () => [props.groupProps, props.divProps, props.transformFunc, props.transform],
            () => nextTick(handleTransform),
            {deep: true}
        )

        onUnmounted(() => {
            konvaGroup?.off('absoluteTranformChange', handleTransform)
            div.remove()
        })
        //teleport para enviar a div do modal para html
        return () => [h(Group, { ref: groupRef, config: props.groupProps}),
            ready.value ? h(Teleport as any, { to: div }, slots.default?.()) : null ]
    },
})
