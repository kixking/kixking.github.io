/**
 * Unit Converter Logic Module
 */
export const UnitConverterLogic = {
    // Conversion rates relative to a base unit (value = 1 base unit)
    definitions: {
        length: {
            base: 'm',
            units: {
                m: 1,
                km: 1000,
                cm: 0.01,
                mm: 0.001,
                inch: 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                mile: 1609.344
            }
        },
        weight: {
            base: 'g',
            units: {
                g: 1,
                kg: 1000,
                mg: 0.001,
                oz: 28.3495,
                lb: 453.592
            }
        },
        data: {
            base: 'B',
            units: {
                B: 1,
                KB: 1024,
                MB: 1048576,
                GB: 1073741824,
                TB: 1099511627776
            }
        },
        web: {
            base: 'px',
            units: {
                px: 1,
                rem: 16, // Default, mutable
                em: 16,
                pt: 1.3333 // 1pt = 1.333px approx (96dpi)
            }
        }
    },

    /**
     * Set root font size for REM/EM conversions
     * @param {number} size usually 16
     */
    setRootFontSize(size) {
        if (size > 0) {
            this.definitions.web.units.rem = size;
            this.definitions.web.units.em = size;
        }
    },

    /**
     * Convert value
     * @param {number} value 
     * @param {string} fromUnit symbol
     * @param {string} toUnit symbol
     * @param {string} category key (optional, for optimization)
     */
    convert(value, fromUnit, toUnit, category = null) {
        if (value === '' || isNaN(value)) return '';

        // Find category if not provided
        if (!category) {
            for (const cat in this.definitions) {
                if (this.definitions[cat].units[fromUnit] && this.definitions[cat].units[toUnit]) {
                    category = cat;
                    break;
                }
            }
        }

        if (!category || !this.definitions[category]) {
            throw new Error(`Unknown units or category: ${fromUnit} -> ${toUnit}`);
        }

        const catDef = this.definitions[category];
        const fromRate = catDef.units[fromUnit];
        const toRate = catDef.units[toUnit];

        if (fromRate === undefined || toRate === undefined) {
            throw new Error(`Invalid unit in category ${category}`);
        }

        // Formula: Value * FromRate / ToRate
        // e.g. 1 km to m: 1 * 1000 / 1 = 1000
        // e.g. 100 cm to m: 100 * 0.01 / 1 = 1
        return (value * fromRate) / toRate;
    },

    getUnits(category) {
        if (this.definitions[category]) {
            return Object.keys(this.definitions[category].units);
        }
        return [];
    }
};
