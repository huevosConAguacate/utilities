export const pages = {
    projects: {
        misDeliciasDeCocina: {
            groupSections: [
                {
                    name: "comida",
                    render: {
                        sections: {

                        },
                        subsections: {
                            featured: (value) => value ? 'featured' : ''
                        }
                    },
                    sections: [
                        {
                            data: {
                                title: "Aves de caza",
                                created: "2025-05-25T19:44:06",
                                lastmod: "2025-05-25T19:44:06",
                            },
                            subsections: [
                                {
                                    data: {
                                        title: "Pollo con patatas",
                                        created: "2025-05-13T19:44:06",
                                        lastmod: "2025-05-16T18:40:06",
                                        socialImageUrl: "pollo-con-patatas-al-horno",
                                        description: "La mejor receta de pollo",
                                        featured: true,
                                        recipe: {
                                            header: {
                                                img: {
                                                    src: "pollo-con-patatas-al-horno",
                                                    desc: "Imagen de pollo con patatas"
                                                },
                                                body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque, earum eligendi id sunt"
                                            },
                                            diners: 2,
                                            time: "30 minutos",
                                            ingredients: {
                                                img: {
                                                    src: "pollo-con-patatas-al-horno",
                                                    desc: "Imagen de los ingredientes"
                                                },
                                                list: [
                                                    "4 patatas medianas",
                                                    "2 cucharadas de aceite de oliva",
                                                    "1 cucharadita de pimentón dulce",
                                                    "1 diente de ajo picado",
                                                    "Sal y pimienta al gusto",
                                                    "Romero o tomillo fresco (opcional)"
                                                ]
                                            },
                                            elaboration: [
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen precalentando el horno a 200°C."
                                                    },
                                                    step: "Precalienta el horno a 200°C."
                                                },
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen lavando y cortando las patatas en gajos."
                                                    },
                                                    step: "Lava bien las patatas y córtalas en gajos."
                                                },
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen mezclando las patatas con especias y aceite en un bol."
                                                    },
                                                    step: "En un bol, mezcla las patatas con el aceite, pimentón, ajo, sal, pimienta y las hierbas."
                                                },
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen colocando las patatas en una bandeja con papel vegetal."
                                                    },
                                                    step: "Coloca las patatas en una bandeja de horno con papel vegetal."
                                                },
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen horneando las patatas hasta que estén doradas y crujientes."
                                                    },
                                                    step: "Hornea durante 35-40 minutos hasta que estén doradas y crujientes."
                                                },
                                                {
                                                    img: {
                                                        src: "pollo-con-patatas-al-horno",
                                                        desc: "Imagen sirviendo las patatas calientes."
                                                    },
                                                    step: "Sirve calientes como acompañamiento o plato principal."
                                                }
                                            ]

                                        }
                                    }
                                },
                                {
                                    data: {
                                        title: "Pavo con batatas",
                                        created: "2025-05-14T10:30:00",
                                        lastmod: "2025-05-16T18:40:06",
                                        socialImageUrl: "pavo-con-batatas-al-horno",
                                        description: "Una receta deliciosa y nutritiva de pavo al horno con batatas.",
                                        featured: false,
                                        recipe: {
                                            header: {
                                                img: {
                                                    src: "pavo-con-batatas-al-horno",
                                                    desc: "Imagen de pavo con batatas al horno"
                                                },
                                                body: "Disfruta de una receta saludable de pavo al horno acompañado de batatas asadas. Perfecta para una cena ligera y nutritiva."
                                            },
                                            diners: 4,
                                            time: "45 minutos",
                                            ingredients: {
                                                img: {
                                                    src: "pavo-con-batatas-al-horno",
                                                    desc: "Imagen de los ingredientes para pavo con batatas"
                                                },
                                                list: [
                                                    "500 g de pechuga de pavo",
                                                    "3 batatas medianas",
                                                    "2 cucharadas de aceite de oliva",
                                                    "1 cucharadita de romero seco",
                                                    "2 dientes de ajo picados",
                                                    "Sal y pimienta al gusto",
                                                    "Zumo de medio limón"
                                                ]
                                            },
                                            elaboration: [
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen precalentando el horno a 200°C."
                                                    },
                                                    step: "Precalienta el horno a 200°C."
                                                },
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen pelando y cortando las batatas en rodajas gruesas."
                                                    },
                                                    step: "Pela las batatas y córtalas en rodajas gruesas."
                                                },
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen mezclando batatas y pavo con especias y aceite."
                                                    },
                                                    step: "En un bol, mezcla las batatas y el pavo con aceite de oliva, ajo, romero, sal, pimienta y zumo de limón."
                                                },
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen distribuyendo la mezcla en una bandeja de horno."
                                                    },
                                                    step: "Coloca la mezcla en una bandeja de horno cubierta con papel vegetal."
                                                },
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen horneando hasta que el pavo esté cocido y las batatas doradas."
                                                    },
                                                    step: "Hornea durante 35-40 minutos hasta que el pavo esté bien cocido y las batatas doradas."
                                                },
                                                {
                                                    img: {
                                                        src: "pavo-con-batatas-al-horno",
                                                        desc: "Imagen sirviendo el plato caliente."
                                                    },
                                                    step: "Sirve caliente y disfruta de este delicioso plato saludable."
                                                }
                                            ]
                                        }
                                    }
                                }

                            ]
                        }
                    ]
                },
                {
                    name: "prueba",
                    sections: []
                }
            ]
        }
    }
}