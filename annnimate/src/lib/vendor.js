import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Flip } from "gsap/Flip";
import { Draggable } from 'gsap/Draggable';
import { cx as classVarianceCx } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";

gsap.registerPlugin(
    ScrollTrigger, 
    ScrambleTextPlugin, 
    SplitText, 
    Draggable,
    Flip,
    InertiaPlugin
 );

export { 
    gsap, 
    useGSAP,        
    ScrollTrigger, 
    SplitText, 
    ScrambleTextPlugin, 
    Draggable,
    Flip,
    InertiaPlugin
 };

export const cx = classVarianceCx;
export { cva } from "class-variance-authority";


const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                "display","h1","h2","h3","h4","h5","h6","subheadline",
                "body","body-lg","body-sm","reading",
                "accent-2xs","accent-xs","accent-base","accent-lg",
                "mono","mono-sm","mono-lg"
            ]
        }
    }
});

export function cn(...inputs) {
    return twMerge(cx(inputs));
}
