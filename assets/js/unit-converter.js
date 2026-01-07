document.addEventListener('DOMContentLoaded', () => {
    const baseFontSizeInput = document.getElementById('base-font-size');

    // --- Conversion Factors (all relative to a base unit in each group) ---

    // Group: Design (Base: px)
    const designConvert = (val, from, baseSize) => {
        let px;
        if (from === 'px') px = val;
        else if (from === 'rem') px = val * baseSize;
        else if (from === 'em') px = val * baseSize;
        else if (from === 'pt') px = val * (96 / 72);

        return {
            px: px,
            rem: px / baseSize,
            em: px / baseSize,
            pt: px / (96 / 72)
        };
    };

    // Group: Storage (Base: B)
    const storageConvert = (val, from) => {
        const units = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 };
        const b = val * units[from];
        return {
            b: b,
            kb: b / units.kb,
            mb: b / units.mb,
            gb: b / units.gb,
            tb: b / units.tb
        };
    };

    // Group: Length (Base: mm)
    const lengthConvert = (val, from) => {
        const units = { mm: 1, cm: 10, m: 1000, km: 1000000, inch: 25.4 };
        const mm = val * units[from];
        return {
            mm: mm,
            cm: mm / units.cm,
            m: mm / units.m,
            km: mm / units.km,
            inch: mm / units.inch
        };
    };

    // --- App Logic ---

    const updateGroup = (groupName, changedUnit, value) => {
        const grid = document.querySelector(`.unit-grid[data-group="${groupName}"]`);
        const inputs = grid.querySelectorAll('input');

        let results = {};
        if (groupName === 'design') {
            results = designConvert(value, changedUnit, parseFloat(baseFontSizeInput.value) || 16);
        } else if (groupName === 'storage') {
            results = storageConvert(value, changedUnit);
        } else if (groupName === 'length') {
            results = lengthConvert(value, changedUnit);
        }

        inputs.forEach(input => {
            const unit = input.dataset.unit;
            if (unit !== changedUnit) {
                const res = results[unit];
                // Format: limit to 6 decimal places, but remove trailing zeros
                input.value = value === '' ? '' : parseFloat(res.toFixed(6));
            }
        });
    };

    // Attach listeners
    document.querySelectorAll('.unit-grid input').forEach(input => {
        const grid = input.closest('.unit-grid');
        const groupName = grid.dataset.group;

        input.addEventListener('input', (e) => {
            const val = e.target.value === '' ? '' : parseFloat(e.target.value);
            updateGroup(groupName, e.target.dataset.unit, val);
        });
    });

    baseFontSizeInput.addEventListener('input', () => {
        // Recalculate design group when base size changes
        const pxInput = document.querySelector('[data-unit="px"]');
        if (pxInput.value !== '') {
            updateGroup('design', 'px', parseFloat(pxInput.value));
        }
    });
});
