export const pages = {
    projects: {
        misDeliciasDeCocina: {
            getStructuredData: (fileType, dom, url) => {
                const links = dom.querySelectorAll('header nav ul a');
                const itemListElement = [];
                for (const link of links) {
                    const label = link.querySelector('span')?.innerHTML;
                    const href = link.href;
                    if (!label || !href) continue;
                    itemListElement.push({
                        "@type": "SiteNavigationElement",
                        "name": label,
                        "url": href
                    })
                }
                const structuredData = [
                    {
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "itemListElement": itemListElement
                    }
                ]
                if (fileType === 'index') {
                    structuredData.push({
                        "@context": "https://schema.org/",
                        "@type": "WebSite",
                        "url": url,
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": `${url}/busqueda/index.html?q={search_term_string}`,
                            "query-input": "required name=search_term_string"
                        }
                    })
                } else if (fileType === 'section-recipes') {

                } else if (fileType === 'subsection-recipes') {
                    structuredData.push({
                        "@context": "https://schema.org/",
                        "@type": "Recipe",
                        "name": dom.querySelector('article header h1').innerHTML,
                        "description": dom.querySelector('article header p').innerHTML.trim(),
                        // "author": {
                        //     "@type": "Person",
                        //     "name": "Micaela Demarchi"
                        // },
                        "image": [
                            dom.querySelector('article header figure img').src
                        ],
                        "totalTime": dom.querySelector('article section time').getAttribute('datetime'),
                        // "recipeYield": 6,
                        // "nutrition": {
                        //     "@type": "NutritionInformation",
                        //     "calories": "303.3 kcal",
                        //     "fatContent": "17.3 g"
                        // },
                        "recipeCategory": dom.querySelector('article').dataset.section,
                        "recipeIngredient": Array.from(dom.querySelectorAll('article section.ingredientes li')).map(li => li.innerHTML),
                        "recipeInstructions":
                            Array.from(dom.querySelectorAll('article section.elaboracion li span')).map(li => { return { "@type": "HowToStep", "text": li.innerHTML } }),
                    })
                }
                return structuredData
            },
            groupSections: [
                {
                    name: "recipes",
                    render: {
                        subsections: {
                            templates: {
                                featured: (value) => value ? 'featured' : '',
                                "recipe.diners": (value) => value === 1 ? '1 comensal' : `${value} comensales`,
                                "recipe.ingredients.list": (value) => value.map(item => `<li>${item}</li>`).join('\n'),
                                "recipe.time.label": (value) => {
                                    const [value1, value2 = null] = value.split(' ').map((v) => Number(v));
                                    let hours = 0, minutes = 0;
                                    if (value2 !== null) {
                                        hours = value1;
                                        minutes = value2;
                                    } else {
                                        minutes = value1;
                                    }
                                    const parts = [];
                                    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
                                    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
                                    return parts.join(' y ');
                                },
                                "recipe.time.value": (value) => {
                                    const [value1, value2 = null] = value.split(' ').map((v) => Number(v));
                                    let hours = 0, minutes = 0;

                                    if (value2 !== null) {
                                        hours = value1;
                                        minutes = value2;
                                    } else {
                                        minutes = value1;
                                    }

                                    let isoString = 'PT';
                                    if (hours > 0) isoString += `${hours}H`;
                                    if (minutes > 0) isoString += `${minutes}M`;

                                    return isoString;
                                },
                                "recipe.elaboration": (value) => {
                                    return value.map(({ img, step }) => {
                                        return `<app-use-template name="receta-paso" data-img="${img.src}" data-imgdesc="${img.desc}">${step}</app-use-template>`;
                                    }).join('\n');
                                }
                            },
                        }
                    },
                    sections: [
                        {
                            data: {
                                title: "Aves de caza",
                                description: "¡Las mejores recetas con aves y carnes de caza! Descubre las más fáciles recetas de aves al horno, rellenas, para Navidad, ocasiones especiales o cualquier día de la semana con estas preparaciones deliciosas que sorprenderán a todos tus comensales.",
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
                                            diners: 1,
                                            time: "1 30",
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
                                        featured: true,
                                        recipe: {
                                            header: {
                                                img: {
                                                    src: "pavo-con-batatas-al-horno",
                                                    desc: "Imagen de pavo con batatas al horno"
                                                },
                                                body: "Disfruta de una receta saludable de pavo al horno acompañado de batatas asadas. Perfecta para una cena ligera y nutritiva."
                                            },
                                            diners: 4,
                                            time: "45",
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