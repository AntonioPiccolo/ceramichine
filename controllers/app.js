const hubspot = require('../utils/hubspot')

const getEvents = async (req, res) => {
    try {
        const event = req.query.event ? req.query.event.split('||')[0].slice(0, -1) : ''
        const when = req.query.event ? req.query.event.split('||')[1].slice(1, req.query.event.split('||')[1].length) : ''
        let events = await hubspot.searchFromHubspot(
        "deals",
        [
            {
            filters: [
                {
                propertyName: "event_name",
                operator: "EQ",
                value: event,
                },
                {
                propertyName: "when",
                operator: "EQ",
                value: when,
                },
            ],
            },
        ],
        ['ticket', 'ticket_validation', 'gift_card'],
        0,
        200,
        null,
        true
        );
        let structuredData = []
        if (events) {
            structuredData = events.map((event) => {
                let formattedDate = ''
                if (event.properties.ticket_validation) {
                    const date = new Date(event.properties.ticket_validation);
                    formattedDate = date.toLocaleString("it-IT", {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                }
                return {
                    Ticket: event.properties.ticket,
                    Validato: event.properties.ticket_validation ? formattedDate.replace(',', '') : '',
                    GiftCard: event.properties.gift_card ? 'X' : ''
                }
            })
        }
        res.json(structuredData);   
    } catch (e) {
        console.error(e)
        res.status(500).send('Error')
    }
}

const getFutureEvents = async (req, res) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const updatedDateStr = date.toISOString();
        const events = await hubspot.searchFromHubspot(
            "deals",
            [
            {
                filters: [
                    {
                        propertyName: "when",
                        operator: "GT",
                        value: updatedDateStr,
                    }
                ],
            },
            ],
            ['event_name', 'when'],
            0,
            200,
            null,
            true
        );
        const structuredData = []
        if (events) {
            events.forEach((event) => {
                eventName = event.properties.event_name
                eventWhen = event.properties.when
                const text = `${eventName} || ${eventWhen}`
                if (structuredData.includes(text) === false) {
                    structuredData.push(text)
                }
            });
        }
        res.json(structuredData);
    } catch (e) {
        console.error(e)
        res.status(500).send('Error')
    }
}

module.exports = {
    getEvents,
    getFutureEvents
};