"use client"

import styles from "./page.module.scss";
import {useEffect, useLayoutEffect, useState} from "react";
import cn from "classnames";
import Image from "next/image";
import reset from './reset.svg'

type Direction = 'left' | 'right' | 'top' | 'bottom'

interface Slot {
    id: number
    value: number
    isActive: boolean
    isEmpty: boolean
    direction?: Direction
}

export default function Home() {
    const [slots, setSlots] = useState<Slot[]>([])
    const [slotsSize, setSlotsSize] = useState(5)
    const [slotSize, setSlotSize] = useState(50)

    function shuffleArray(array: number[]): void {
        let currentIndex = array.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex]
            ];
        }
    }


    const randomValues = Array.from({ length: slotsSize**2 }, (_, index) => index);
    const generateSlots = () => {
        shuffleArray(randomValues)
        const newSlots: Slot[] = []
        for (let i = 0; i < slotsSize**2; i++) {
            newSlots.push({
                id: i,
                value: randomValues[i],
                isActive: false,
                isEmpty: randomValues[i] === 0
            });
        }
        setNearSlots(newSlots)
    }

    const setNearSlots = (array: Slot[]) => {
        const emptySlot = array.find(value => value.value === 0)
        if (!emptySlot) return
        const ownValues = []
        for (let i = 0; i < slotsSize ** 2; i++) {
            if (i % slotsSize === 0) {
                ownValues.push(i)
                ownValues.push(i + slotsSize - 1)
            }
        }
        let left = array.find(value => value.id === emptySlot.id - 1)
        if (left) left.direction = 'left'
        let right = array.find(value => value.id === emptySlot.id + 1)
        if (right) right.direction = 'right'
        const top = array.find(value => value.id === emptySlot.id - slotsSize)
        if (top) top.direction = 'top'
        const bottom = array.find(value => value.id === emptySlot.id + slotsSize)
        if (bottom) bottom.direction = 'bottom'
        if (ownValues.includes(emptySlot.id)) {
            if (right && ownValues.includes(right.id)) right = undefined
            if (left && ownValues.includes(left.id)) left = undefined
        }
        const nearItems: (Slot | undefined)[] = [
            right,
            left,
            top,
            bottom
        ].filter(v => v !== undefined)

        setSlots(array.map((slot) => {
            const foundSlot = nearItems.find(value => value?.id === slot.id)
            if (foundSlot) return {...slot, isActive: true, type: foundSlot.direction}
            return {...slot, isActive: false}
        }))
    }

    useLayoutEffect(() => {
        generateSlots()
    }, []);

    const generateTemplateColumns = () => {
        let string = ''
        for (let i = 0; i < slotsSize; i++) {
            string += ' 1fr'
        }
        return string
    }

    const handleClick = (slot: Slot) => {
        if (!slot.isActive || animate !== null) return
        const emptySlot = slots.find(value => value.value === 0)
        if (!emptySlot) return
        const newArrayOfSlots: Slot[] = slots.map((item) => {
            if (item.id === emptySlot.id)
                // empty -> slot
                return {
                    ...slot,
                    id: emptySlot.id,
                    value: slot.value,
                    direction: 'right',
                    isEmpty: false,
                    isActive: true
                }
            if (item.id === slot.id)
                // slot -> empty
                return {
                    ...slot,
                    id: slot.id,
                    value: 0,
                    direction: undefined,
                    isEmpty: true,
                    isActive: false
                }
            return item
        })

        if (!slot.direction) return;

        setAnimate({
            slotID: slot.id,
            direction: slot.direction
        })
        setTimeout(() => {
            setNearSlots(newArrayOfSlots)
            setAnimate(null)
        }, animationTime)
    }

    const animationTime = .15 * 1000
    const [animate, setAnimate] = useState<null | {
        slotID: number
        direction: Direction
    }>(null)

    useEffect(() => {
        generateSlots()
    }, [slotsSize]);

    return (
        <main className={styles.main}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Barley break</h1>
                    <button onClick={generateSlots}>
                        <Image src={reset} alt={'svg'} />
                    </button>
                </div>
                <div className={styles.inputs}>
                    <h4>Board size:</h4>
                    <input
                        value={slotsSize.toString()}
                        onChange={({target}) => {
                            if (typeof parseInt(target.value) !== 'number') return
                            if (parseInt(target.value) > 10 || parseInt(target.value) < 3) return
                            if (target.value === '') return;
                            setSlotsSize(parseInt(target.value))
                        }}
                        className={styles.inputStyles} />
                </div>
                <div
                    style={{
                        width: slotsSize * slotSize + 'px',
                        height: slotsSize * slotSize + 'px',
                        gridTemplateColumns: generateTemplateColumns()
                    }}
                    className={styles.cards}>
                    {slots.map((slot) => {
                        if (slot.value === 0) return <button
                            title={slot.id.toString()}
                            key={slot.id} className={styles.emptySlot}>
                            {/*<h2>{slot.value}</h2>*/}
                        </button>
                        return <button
                            style={{transitionDuration: animationTime + 'ms'}}
                            onClick={() => handleClick(slot)}
                            key={slot.id}
                            title={slot.id.toString()}
                            className={cn(
                                styles.slot,
                                {[styles.active]: slot.isActive},
                                {[styles.moveLeft]: animate?.slotID === slot.id && slot.direction === 'left'},
                                {[styles.moveRight]: animate?.slotID === slot.id && slot.direction === 'right'},
                                {[styles.moveTop]: animate?.slotID === slot.id && slot.direction === 'top'},
                                {[styles.moveBottom]: animate?.slotID === slot.id && slot.direction === 'bottom'},
                            )}>
                            <h2>{slot.value}</h2>
                        </button>
                    })}
                </div>
            </div>
        </main>
    );
}
