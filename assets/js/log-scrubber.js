import { Anonymizer } from './modules/anonymizer.js';

document.addEventListener('DOMContentLoaded', () => {
    const anonymizer = new Anonymizer();

    const elements = {
        input: document.getElementById('input-text'),
        output: document.getElementById('output-text'),
        btnScrub: document.getElementById('btn-scrub'),
        btnClear: document.getElementById('btn-clear'),
        btnPaste: document.getElementById('btn-paste'),
        btnCopy: document.getElementById('btn-copy'),
        btnSample: document.getElementById('btn-sample'),
        checkboxes: {
            ipv4: document.getElementById('opt-ipv4'),
            ipv6: document.getElementById('opt-ipv6'),
            mac: document.getElementById('opt-mac'),
            aws_key_id: document.getElementById('opt-aws'),
            google_key: document.getElementById('opt-google'),
            github_token: document.getElementById('opt-github'),
            slack_token: document.getElementById('opt-slack'),
            private_key: document.getElementById('opt-private'),
            bearer_token: document.getElementById('opt-bearer'),
            email: document.getElementById('opt-email'),
            phone: document.getElementById('opt-phone'),
            credit_card: document.getElementById('opt-cc'),
            ssn: document.getElementById('opt-ssn'),
            my_number: document.getElementById('opt-mynum'),
            date: document.getElementById('opt-date'),
            uuid: document.getElementById('opt-uuid'),
        },
        mappingBody: document.getElementById('mapping-body')
    };

    // Main Scrub Function
    const performScrub = () => {
        const text = elements.input.value;
        if (!text) return;

        // Reset mapping for new run? 
        // Strategy: Keep mapping consistent within session unless cleared.
        // If user wants fresh mapping, they can refresh or we could add a reset button.
        // For now, let's keep it consistent so multiple pastes use same [IP_1].
        
        const options = {
            ipv4: elements.checkboxes.ipv4.checked,
            ipv6: elements.checkboxes.ipv6.checked,
            mac: elements.checkboxes.mac.checked,
            aws_key_id: elements.checkboxes.aws_key_id.checked,
            google_key: elements.checkboxes.google_key.checked,
            github_token: elements.checkboxes.github_token.checked,
            slack_token: elements.checkboxes.slack_token.checked,
            private_key: elements.checkboxes.private_key.checked,
            bearer_token: elements.checkboxes.bearer_token.checked,
            email: elements.checkboxes.email.checked,
            phone: elements.checkboxes.phone.checked,
            credit_card: elements.checkboxes.credit_card.checked,
            ssn: elements.checkboxes.ssn.checked,
            my_number: elements.checkboxes.my_number.checked,
            date: elements.checkboxes.date.checked,
            uuid: elements.checkboxes.uuid.checked,
        };

        const result = anonymizer.scrub(text, options);
        elements.output.value = result;

        updateMappingTable();
    };

    // Update Mapping Table UI
    const updateMappingTable = () => {
        const mapping = anonymizer.getMapping();
        elements.mappingBody.innerHTML = '';
        
        for (const [original, placeholder] of Object.entries(mapping)) {
            const row = document.createElement('tr');
            
            const cellOriginal = document.createElement('td');
            cellOriginal.textContent = original;
            
            const cellReplacement = document.createElement('td');
            cellReplacement.textContent = placeholder;
            cellReplacement.style.color = '#2ecc71';
            cellReplacement.style.fontWeight = 'bold';
            
            row.appendChild(cellOriginal);
            row.appendChild(cellReplacement);
            elements.mappingBody.appendChild(row);
        }
    };

    // Event Listeners
    elements.btnScrub.addEventListener('click', performScrub);

    elements.btnClear.addEventListener('click', () => {
        elements.input.value = '';
        elements.output.value = '';
        anonymizer.reset();
        updateMappingTable();
        elements.input.focus();
    });

    elements.btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            elements.input.value = text;
            performScrub(); // Auto run on paste button
        } catch (err) {
            console.error('Failed to read clipboard', err);
            alert('Clipboard access denied or failed.');
        }
    });

    elements.btnSample.addEventListener('click', async () => {
        try {
            const response = await fetch('./sample_data.txt');
            if (response.ok) {
                const text = await response.text();
                elements.input.value = text;
            } else {
                console.error('Failed to load sample data');
            }
        } catch (err) {
            console.error('Error loading sample:', err);
        }
    });

    elements.btnCopy.addEventListener('click', async () => {
        const text = elements.output.value;
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            const originalText = elements.btnCopy.textContent;
            elements.btnCopy.textContent = 'Copied!';
            setTimeout(() => {
                elements.btnCopy.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to write clipboard', err);
        }
    });
});
