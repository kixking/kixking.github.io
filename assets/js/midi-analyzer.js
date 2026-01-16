document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('midi-file');
    const analysisResult = document.getElementById('analysis-result');
    const fileNameDisp = document.getElementById('file-name');
    const formatDisp = document.getElementById('midi-format');
    const ppqDisp = document.getElementById('midi-ppq');
    const trackCountDisp = document.getElementById('track-count');
    const metaTableBody = document.querySelector('#meta-events-table tbody');
    const tracksList = document.getElementById('tracks-list');
    const fullEventsBody = document.getElementById('full-events-body');
    const trackFilter = document.getElementById('track-filter');
    const typeFilter = document.getElementById('type-filter');
    const rawJsonOutput = document.getElementById('raw-json-output');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const eventLimitMsg = document.getElementById('event-limit-msg');
    const toast = document.getElementById('toast');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    let currentMidi = null;
    let allEvents = [];

    const CC_NAMES = {
        1: 'Modulation',
        7: 'Volume',
        10: 'Pan',
        11: 'Expression',
        64: 'Sustain Pedal',
        91: 'Reverb Send',
        93: 'Chorus Send'
    };

    // Tab Handling
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // File Handling
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.mid') || file.name.endsWith('.midi'))) {
            processFile(file);
        } else {
            alert('MIDIファイルを選択してください。');
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });

    const processFile = async (file) => {
        fileNameDisp.textContent = file.name;

        try {
            const arrayBuffer = await file.arrayBuffer();
            currentMidi = new Midi(arrayBuffer);

            renderAnalysis(currentMidi);
            analysisResult.style.display = 'block';
        } catch (error) {
            console.error(error);
            alert('MIDIの解析に失敗しました。ファイルが壊れているか、対応していない形式の可能性があります。');
        }
    };

    const renderAnalysis = (midi) => {
        // Header
        formatDisp.textContent = 'Standard';
        ppqDisp.textContent = midi.header.ppq;
        trackCountDisp.textContent = midi.tracks.length;

        // RAW JSON
        rawJsonOutput.value = JSON.stringify(midi, null, 2);

        // Meta Events
        metaTableBody.textContent = '';
        const metaEvents = extractMetaEvents(midi);
        metaEvents.forEach(evt => {
            const tr = document.createElement('tr');

            [evt.ticks, evt.time.toFixed(3)].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                tr.appendChild(td);
            });

            // Type Badge
            const tdType = document.createElement('td');
            const span = document.createElement('span');
            span.className = `badge ${getEventBadgeClass(evt.type)}`;
            span.textContent = evt.type;
            tdType.appendChild(span);
            tr.appendChild(tdType);

            // Value
            const tdVal = document.createElement('td');
            tdVal.textContent = evt.value;
            tr.appendChild(tdVal);

            metaTableBody.appendChild(tr);
        });

        // Tracks List & Filter Setup
        tracksList.textContent = '';
        trackFilter.textContent = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'すべて';
        trackFilter.appendChild(allOption);

        allEvents = [];

        midi.tracks.forEach((track, index) => {
            const trackName = track.name || `Track ${index}`;

            // Add to filter
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = trackName;
            trackFilter.appendChild(opt);

            // Collect All Events
            track.notes.forEach(n => {
                allEvents.push({ ticks: n.ticks, trackId: index, trackName, type: 'Note', d1: n.name, d2: `Vel: ${Math.round(n.velocity * 127)}`, val: `Dur: ${n.durationTicks}` });
            });
            track.controlChanges && Object.keys(track.controlChanges).forEach(ccNum => {
                track.controlChanges[ccNum].forEach(cc => {
                    const ccName = CC_NAMES[cc.number] || `CC ${cc.number}`;
                    allEvents.push({ ticks: cc.ticks, trackId: index, trackName, type: 'Control', d1: ccName, d2: cc.number, val: Math.round(cc.value * 127) });
                });
            });
            track.pitchBends && track.pitchBends.forEach(pb => {
                allEvents.push({ ticks: pb.ticks, trackId: index, trackName, type: 'Pitch', d1: 'Pitch Bend', d2: '-', val: pb.value.toFixed(4) });
            });

            // Render Track Summary
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track-item';

            // Header
            const trackHeader = document.createElement('div');
            trackHeader.className = 'track-header';

            const titleContainer = document.createElement('div');
            const nameSpan = document.createElement('span');
            nameSpan.className = 'track-name';
            nameSpan.textContent = trackName;
            titleContainer.appendChild(nameSpan);

            if (track.instrument) {
                const instSpan = document.createElement('span');
                instSpan.style.cssText = 'font-size: 0.8rem; color: var(--accent); margin-left: 0.5rem;';
                instSpan.textContent = `[${track.instrument.name}]`;
                titleContainer.appendChild(instSpan);
            }
            trackHeader.appendChild(titleContainer);

            const statsSpan = document.createElement('span');
            statsSpan.className = 'track-stats';
            statsSpan.textContent = `Notes: ${track.notes.length} | Ch: ${track.channel}`;
            trackHeader.appendChild(statsSpan);

            // Details
            const trackDetails = document.createElement('div');
            trackDetails.className = 'track-details';
            trackDetails.style.cssText = 'font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;';

            const totalEvents = track.notes.length + (track.controlChanges ? Object.values(track.controlChanges).flat().length : 0);
            const statsText = document.createElement('div');
            statsText.innerHTML = `<strong>合計イベント数:</strong> ${totalEvents}`; // Safe because totalEvents is number
            trackDetails.appendChild(statsText);

            if (track.notes.length > 0) {
                const rangeText = document.createElement('div');
                rangeText.innerHTML = `<strong>音域:</strong> ${getNoteRange(track.notes)}`; // getNoteRange returns generated string or '-'
                trackDetails.appendChild(rangeText);
            }

            trackDiv.appendChild(trackHeader);
            trackDiv.appendChild(trackDetails);
            tracksList.appendChild(trackDiv);
        });

        allEvents.sort((a, b) => a.ticks - b.ticks);
        updateDetailedEvents();
    };

    const updateDetailedEvents = () => {
        const tFilter = trackFilter.value;
        const typeF = typeFilter.value;

        let filtered = allEvents;
        if (tFilter !== 'all') {
            filtered = filtered.filter(e => e.trackId == tFilter);
        }
        if (typeF !== 'all') {
            const mappedType = { 'note': 'Note', 'control': 'Control', 'pitch': 'Pitch' }[typeF];
            filtered = filtered.filter(e => e.type === mappedType);
        }

        fullEventsBody.textContent = '';
        const limit = 2000;
        const displayList = filtered.slice(0, limit);

        eventLimitMsg.style.display = filtered.length > limit ? 'block' : 'none';

        displayList.forEach(evt => {
            const tr = document.createElement('tr');

            const tdTicks = document.createElement('td');
            tdTicks.textContent = evt.ticks;
            tr.appendChild(tdTicks);

            const tdTrack = document.createElement('td');
            tdTrack.style.fontSize = '0.75rem';
            tdTrack.textContent = evt.trackName;
            tr.appendChild(tdTrack);

            const tdType = document.createElement('td');
            const span = document.createElement('span');
            span.className = `badge ${getEventBadgeClass(evt.type)}`;
            span.textContent = evt.type;
            tdType.appendChild(span);
            tr.appendChild(tdType);

            [evt.d1, evt.d2, evt.val].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                tr.appendChild(td);
            });

            fullEventsBody.appendChild(tr);
        });
    };

    const extractMetaEvents = (midi) => {
        const events = [];
        midi.header.tempos.forEach(t => {
            events.push({ ticks: t.ticks, time: t.time, type: 'Tempo', value: `${Math.round(t.bpm * 100) / 100} BPM` });
        });
        midi.header.timeSignatures.forEach(ts => {
            events.push({ ticks: ts.ticks, time: ts.time, type: 'TimeSig', value: `${ts.timeSignature[0]}/${ts.timeSignature[1]}` });
        });
        if (midi.header.name) {
            events.push({ ticks: 0, time: 0, type: 'SongName', value: midi.header.name });
        }
        midi.tracks.forEach((track, i) => {
            if (track.name) {
                events.push({ ticks: 0, time: 0, type: 'TrackName', value: `[Tr ${i}] ${track.name}` });
            }
        });
        return events.sort((a, b) => a.ticks - b.ticks);
    };

    const getNoteRange = (notes) => {
        if (notes.length === 0) return '-';
        const midiNums = notes.map(n => n.midi);
        const min = Math.min(...midiNums);
        const max = Math.max(...midiNums);
        return `${notes.find(n => n.midi === min).name} (${min}) ~ ${notes.find(n => n.midi === max).name} (${max})`;
    };

    const getEventBadgeClass = (type) => {
        switch (type) {
            case 'Tempo': return 'utility';
            case 'TimeSig': return 'security';
            case 'Note': return 'text';
            case 'Control': return 'generator';
            case 'Pitch': return 'image';
            default: return 'utility';
        }
    };

    // Filter Events
    trackFilter.addEventListener('change', updateDetailedEvents);
    typeFilter.addEventListener('change', updateDetailedEvents);

    copyJsonBtn.addEventListener('click', () => {
        if (!rawJsonOutput.value) return;
        navigator.clipboard.writeText(rawJsonOutput.value).then(() => {
            toast.textContent = 'JSONをコピーしました';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        });
    });
});
