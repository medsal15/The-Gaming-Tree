addLayer('auto', {
    name: 'Automation',
    symbol: '🤖',
    startData() {
        return {
            unlocked: true,
        };
    },
    color: '#cccccc',
    row: 'side',
    resource: 'switches',
    position: 0,
    layerShown() {
        return Object.keys(layers[this.layer].clickables).filter(id => !isNaN(id) && tmp[this.layer].clickables[id].unlocked).length > 0;
    },
    tabFormat: {
        'Toggles': {
            content: [
                'clickables'
            ],
        },
    },
    clickables: {
    },
    tooltip() {
        let levers = Object.keys(layers[this.layer].clickables).filter(id => !isNaN(id) && tmp[this.layer].clickables[id].unlocked);

        let line = `<span>${levers.length} switches</span>`;

        return line;
    },
    type: 'none',
});
