import { defineComponent, shallowRef, ref, onMounted, nextTick, watch, h } from "vue"
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

const needForceStyle = (el: HTMLElement): boolean => {
    const pos = window.getComputedStyle(el).position;
    const ok = pos === 'absolute' || pos === 'relative';
    return !ok;
};

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
        const div = ref<HTMLDivElement>(document.createElement('div'));

        const handleTransform = () => {
            if(!groupRef.value || !div.value) return;
            if(!props.transform) {
                Object.assign(div.value.style, {
                    position: '',
                    zIndex: '',
                    top: '',
                    left: '',
                    transform: '',
                    transformOrigin: '',
                })
                return;
            }
            const tr = groupRef.value.getAbsoluteTransform();
            let attrs = tr.decompose() as DecomposedTransform;

            if(props.transformFunc) {
                attrs = props.transformFunc(attrs);
            }

            Object.assign(div.value.style, {
                position: 'absolute',
                zIndex: '10',
                top: '0px',
                left: '0px',
                transform: `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`,
                transformOrigin: 'top left',
            })

            const { style, ...rest } = props.divProps ?? {}
            if (style) Object.assign(div.value.style, style) 
            Object.assign(div.value, rest)
        }

        onMounted(() => {
            if(!groupRef.value) return;

            const stage = groupRef.value.getStage();
            if(!stage) return;

            const parent = props.parentNodeFunc ? props.parentNodeFunc({stage}) : stage.container()

            if(!parent) return;

            parent.appendChild(div.value)

            if(props.transform && needForceStyle(parent)) {
                parent.style.position = 'relative';
            }

            groupRef.value.on('absoluteTransformChange', handleTransform)
            handleTransform()

            return () => {
                groupRef.value?.off('absoluteTransformChange', handleTransform)
                div.value?.parentNode?.removeChild(div.value)
            }
        })

        watch(
            () => [props.divProps, props.transformFunc, props.transform],
            () => nextTick(handleTransform),
            {deep: true}
        )

        watch(groupRef, (val) => {
            if(val) nextTick(handleTransform)
        })

        return () => h(Group, { ref: groupRef, ...props.groupProps}, slots.default?.())
    },
})
