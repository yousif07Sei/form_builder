import './bootstrap';
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
import 'primeicons/primeicons.css';

const CleanPreset = definePreset(Aura, {
    primitive: {
        zinc: {
            0: '#ffffff',
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
            950: '#09090b'
        }
    },
    components: {
        menubar: {
            colorScheme: {
                light: {
                    root: {
                        background: '{zinc.50}',
                        borderColor: '{zinc.300}',
                        color: '{zinc.900}'
                    }
                },
                dark: {
                    root: {
                        background: '{zinc.950}',
                        borderColor: '{zinc.800}',
                        color: '{zinc.200}'
                    }
                }
            }
        },
        inputtext: {
            colorScheme: {
                light: {
                    root: {
                        background: '{zinc.0}',
                        color: '{zinc.900}',
                        borderColor: '{zinc.300}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.600}'
                    }
                },
                dark: {
                    root: {
                        background: '{zinc.900}',
                        color: '{zinc.200}',
                        borderColor: '{zinc.700}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.400}'
                    }
                }
            }
        },
        textarea: {
            colorScheme: {
                light: {
                    root: {
                        background: '{zinc.0}',
                        color: '{zinc.900}',
                        borderColor: '{zinc.300}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.600}'
                    }
                },
                dark: {
                    root: {
                        background: '{zinc.900}',
                        color: '{zinc.200}',
                        borderColor: '{zinc.700}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.400}'
                    }
                }
            }
        },
        dropdown: {
            colorScheme: {
                light: {
                    root: {
                        background: '{zinc.0}',
                        color: '{zinc.900}',
                        borderColor: '{zinc.300}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.600}'
                    }
                },
                dark: {
                    root: {
                        background: '{zinc.900}',
                        color: '{zinc.200}',
                        borderColor: '{zinc.700}',
                        disabledBackground: 'transparent',
                        disabledColor: '{zinc.400}'
                    }
                }
            }
        },
        panelmenu: {
            colorScheme: {
                light: {
                    root: {
                        background: '{zinc.50}',
                        color: '{zinc.900}'
                    },
                    panel: {
                        background: '{zinc.50}',
                        borderColor: '{zinc.300}'
                    },
                    item: {
                        color: '{zinc.900}',
                        hoverBackground: '{zinc.100}',
                        hoverColor: '{zinc.950}'
                    }
                },
                dark: {
                    root: {
                        background: '{zinc.950}',
                        color: '{zinc.200}'
                    },
                    panel: {
                        background: '{zinc.950}',
                        borderColor: '{zinc.800}'
                    },
                    item: {
                        color: '{zinc.200}',
                        hoverBackground: '{zinc.900}',
                        hoverColor: '{zinc.50}'
                    }
                }
            }
        }
    },
    semantic: {
        primary: {
            50: '{zinc.50}',
            100: '{zinc.100}',
            200: '{zinc.200}',
            300: '{zinc.300}',
            400: '{zinc.400}',
            500: '{zinc.950}',
            600: '{zinc.950}',
            700: '{zinc.950}',
            800: '{zinc.950}',
            900: '{zinc.950}',
            950: '{zinc.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff'
                },
                surface: {
                    0: '{zinc.50}',
                    50: '{zinc.100}',
                    100: '{zinc.200}',
                    200: '{zinc.300}',
                    300: '{zinc.400}',
                    400: '{zinc.500}',
                    500: '{zinc.600}',
                    600: '{zinc.700}',
                    700: '{zinc.800}',
                    800: '{zinc.900}',
                    900: '{zinc.950}',
                    950: '{zinc.950}'
                },
                formField: {
                    color: '{zinc.900}',
                    background: '{zinc.0}',
                    hoverBorderColor: '{zinc.400}',
                    focusBorderColor: '{primary.color}'
                },
                menubar: {
                    background: '{surface.0}',
                    borderColor: '{surface.200}',
                    color: '{surface.700}'
                },
                text: {
                    color: '{zinc.900}',
                    hoverColor: '{zinc.950}',
                    mutedColor: '{zinc.500}',
                    highlightColor: '{zinc.950}'
                }
            },
            dark: {
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{zinc.950}'
                },
                surface: {
                    0: '{zinc.950}',
                    50: '{zinc.900}',
                    100: '{zinc.800}',
                    200: '{zinc.800}',
                    300: '{zinc.700}',
                    400: '{zinc.600}',
                    500: '{zinc.500}',
                    600: '{zinc.400}',
                    700: '{zinc.300}',
                    800: '{zinc.200}',
                    900: '{zinc.100}',
                    950: '{zinc.50}'
                },
                formField: {
                    color: '{zinc.200}',
                    background: '{zinc.900}',
                    hoverBorderColor: '{zinc.600}',
                    focusBorderColor: '{primary.color}'
                },
                menubar: {
                    background: '{zinc.950}',
                    borderColor: '{zinc.800}',
                    color: '{zinc.200}'
                },
                text: {
                    color: '{zinc.200}',
                    hoverColor: '{zinc.50}',
                    mutedColor: '{zinc.400}',
                    highlightColor: '{zinc.50}'
                }
            }
        }
    }
});

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
        return pages[`./Pages/${name}.vue`];
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(PrimeVue, {
                theme: {
                    preset: CleanPreset,
                    options: {
                        darkModeSelector: '.dark'
                    }
                }
            })
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
