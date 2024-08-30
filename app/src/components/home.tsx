import React, {useState, useRef, useEffect} from 'react'
import {Canvas, useFrame, extend, useThree} from '@react-three/fiber'
import {OrbitControls, Html, Environment} from '@react-three/drei'
import * as THREE from 'three'
import {Button} from "../components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../components/ui/accordion"

extend({OrbitControls})

const PhoneModel = ({exploded, selectedPart, setSelectedPart}) => {
    const [hovered, setHovered] = useState(null)

    const parts = {
        Screen: {
            position: [0, 0.05, 0.02],
            color: 'lightblue',
            size: [0.07, 0.15, 0.007],
            labelOffset: [0, 0.08, 0.01]
        },
        Battery: {
            position: [0, -0.02, 0],
            color: 'limegreen',
            size: [0.06, 0.11, 0.004],
            labelOffset: [0.035, 0, 0.005]
        },
        Motherboard: {
            position: [0, -0.04, 0],
            color: 'orange',
            size: [0.05, 0.1, 0.002],
            labelOffset: [-0.03, 0, 0.005]
        },
        Camera: {
            position: [0.025, 0.06, 0.01],
            color: 'gray',
            size: [0.015, 0.015, 0.005],
            labelOffset: [0.01, 0.01, 0.005]
        },
        Speaker: {
            position: [0, -0.065, 0.01],
            color: 'darkgray',
            size: [0.03, 0.006, 0.006],
            labelOffset: [0, -0.01, 0.005]
        },
        Chassis: {position: [0, 0, 0], color: 'silver', size: [0.075, 0.16, 0.008], labelOffset: [-0.04, -0.08, 0.005]}
    }

    useFrame(() => {
        Object.entries(parts).forEach(([name, part]) => {
            const mesh = part.ref.current
            if (mesh) {
                if (exploded) {
                    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, part.position[2] + (name === 'Screen' ? 0.02 : name === 'Battery' ? -0.02 : name === 'Motherboard' ? -0.03 : 0), 0.1)
                } else {
                    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, part.position[2], 0.1)
                }
                mesh.scale.setScalar(name === hovered ? 1.05 : 1)
            }
        })
    })

    const createRoundedRectShape = (width, height, radius) => {
        const shape = new THREE.Shape()
        shape.moveTo(-width / 2, -height / 2 + radius)
        shape.lineTo(-width / 2, height / 2 - radius)
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2)
        shape.lineTo(width / 2 - radius, height / 2)
        shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius)
        shape.lineTo(width / 2, -height / 2 + radius)
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2)
        shape.lineTo(-width / 2 + radius, -height / 2)
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius)
        return shape
    }

    return (
        <group>
            {Object.entries(parts).map(([name, part]) => {
                part.ref = useRef()
                const isChassisOrScreen = name === 'Chassis' || name === 'Screen'
                const geometry = isChassisOrScreen
                    ? new THREE.ExtrudeGeometry(
                        createRoundedRectShape(part.size[0], part.size[1], 0.01),
                        {depth: part.size[2], bevelEnabled: false}
                    )
                    : new THREE.BoxGeometry(...part.size)

                return (
                    <mesh
                        key={name}
                        ref={part.ref}
                        position={[part.position[0], part.position[1], part.position[2]]}
                        onClick={() => setSelectedPart(name)}
                        onPointerOver={() => setHovered(name)}
                        onPointerOut={() => setHovered(null)}
                        geometry={geometry}
                    >
                        <meshPhysicalMaterial
                            color={selectedPart === name ? 'yellow' : part.color}
                            metalness={name === 'Chassis' ? 0.7 : 0.1}
                            roughness={name === 'Chassis' ? 0.2 : 0.8}
                            clearcoat={name === 'Screen' ? 1 : 0}
                            clearcoatRoughness={0.1}
                        />
                        <Html
                            position={part.labelOffset}
                            style={{
                                display: (exploded || name === hovered) ? 'block' : 'none',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                color: 'white',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                fontSize: '8px',
                                pointerEvents: 'none',
                            }}
                        >
                            {name}
                        </Html>
                    </mesh>
                )
            })}
        </group>
    )
}

const Scene = ({exploded, selectedPart, setSelectedPart}) => {
    const {camera} = useThree()

    useEffect(() => {
        camera.position.set(0, 0, 0.5)
    }, [camera])

    useFrame(() => {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, exploded ? 0.6 : 0.5, 0.1)
    })

    return (
        <>
            <Environment preset="apartment" background/>
            <ambientLight intensity={0.5}/>
            <spotLight position={[1, 1, 1]} angle={0.15} penumbra={1} intensity={0.5}/>
            <PhoneModel exploded={exploded} selectedPart={selectedPart} setSelectedPart={setSelectedPart}/>
            <OrbitControls minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI - Math.PI / 6}/>
        </>
    )
}

export default function Component() {
    const [exploded, setExploded] = useState(false)
    const [selectedPart, setSelectedPart] = useState(null)

    const getPartInfo = (part) => {
        switch (part) {
            case 'Screen':
                return {
                    name: 'Screen',
                    specs: {
                        type: 'Super Retina XDR OLED',
                        size: '6.1 inches',
                        resolution: '2532 x 1170 pixels',
                        ppi: '460 ppi',
                        features: 'HDR, True Tone, Wide color (P3)',
                        protection: 'Ceramic Shield'
                    },
                    connections: ['Connected to Motherboard via MIPI DSI interface']
                }
            case 'Battery':
                return {
                    name: 'Battery',
                    specs: {
                        capacity: '3240 mAh',
                        type: 'Li-Ion',
                        voltage: '3.81 V',
                        wattHours: '12.41 Wh',
                        charging: 'Fast charging 20W, MagSafe wireless charging 15W, Qi wireless charging 7.5W'
                    },
                    connections: ['Connected to Motherboard via battery connector']
                }
            case 'Motherboard':
                return {
                    name: 'Motherboard',
                    specs: {
                        chip: 'A15 Bionic',
                        cpu: '6-core (2 high-performance + 4 high-efficiency)',
                        gpu: '5-core Apple-designed GPU',
                        neuralEngine: '16-core',
                        ram: '6 GB LPDDR4X',
                        storage: '128 GB / 256 GB / 512 GB'
                    },
                    connections: ['Connected to Screen, Battery, Camera, and Speaker']
                }
            case 'Camera':
                return {
                    name: 'Camera',
                    specs: {
                        main: '12 MP, f/1.6, 26mm (wide), 1.7µm, dual pixel PDAF, sensor-shift OIS',
                        ultraWide: '12 MP, f/2.4, 13mm, 120˚ (ultrawide)',
                        features: 'Dual-LED dual-tone flash, HDR (photo/panorama)'
                    },
                    connections: ['Connected to Motherboard via MIPI CSI interface']
                }
            case 'Speaker':
                return {
                    name: 'Speaker',
                    specs: {
                        type: 'Stereo speakers',
                        features: 'Dolby Atmos, spatial audio'
                    },
                    connections: ['Connected to Motherboard via flex cable']
                }
            case 'Chassis':
                return {
                    name: 'Chassis',
                    specs: {
                        material: 'Aluminum frame with glass front and back',
                        waterResistance: 'IP68 dust/water resistant (up to 6m for 30 mins)',
                        dimensions: '146.7 x 71.5 x 7.7 mm',
                        weight: '174 g'
                    },
                    connections: ['Houses and protects all internal components']
                }
            default:
                return null
        }
    }

    return (
        <div className="flex h-screen">
            <div className="w-3/4 bg-gradient-to-br from-gray-100 to-gray-200">
                <Canvas camera={{position: [0, 0, 0.5], fov: 50}} dpr={[1, 2]}>
                    <Scene exploded={exploded} selectedPart={selectedPart} setSelectedPart={setSelectedPart}/>
                </Canvas>
            </div>
            <div className="w-1/4 bg-white p-4 flex flex-col shadow-lg overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">3D Repair App Demo</h1>
                <Button
                    onClick={() => setExploded(!exploded)}
                    className="mb-4"
                >
                    {exploded ? 'Collapse View' : 'Explode View'}
                </Button>
                {selectedPart && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle
                                className="text-lg font-semibold text-gray-700">{getPartInfo(selectedPart).name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="specs">
                                    <AccordionTrigger>Specifications</AccordionTrigger>
                                    <AccordionContent>
                                        {Object.entries(getPartInfo(selectedPart).specs).map(([key, value]) => (
                                            <p key={key} className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                                            </p>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="connections">
                                    <AccordionTrigger>Connections</AccordionTrigger>
                                    <AccordionContent>
                                        {getPartInfo(selectedPart).connections.map((connection, index) => (
                                            <p key={index} className="text-sm text-gray-600">{connection}</p>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
                <div className="mt-auto">
                    <p className="text-xs text-gray-500">
                        Click on a part to view details. Use mouse or touch to rotate and zoom the 3D model.
                    </p>
                </div>
            </div>
        </div>
    )
}