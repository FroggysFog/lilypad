
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FullCalendar === 'undefined') return;

    // Calendar 1 (#calendar)
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        // Initialize external events (the draggable ones) if element exists
        var containerEl = document.getElementById('external-events');
        if (containerEl && FullCalendar.Draggable) {
            new FullCalendar.Draggable(containerEl, {
                itemSelector: '.fc-event',
                eventData: function (eventEl) {
                    var className = eventEl.getAttribute('data-event-classname'); // Get the class name
                    return {
                        title: eventEl.innerText.trim(),
                        classNames: [className], // Pass dynamic class name
                    };
                }
            });
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            initialView: 'dayGridMonth',
            events: [
                {
                    title: 'Meeting with Team Dev',
                    className: 'badge bg-pink',
                    start: new Date(Date.now() - 168000000).toISOString().slice(0, 10),
                    end: new Date(Date.now() - 168000000).toISOString().slice(0, 10),
                },
                {
                    title: 'UI/UX Team...',
                    className: 'badge bg-secondary',
                    start: new Date(Date.now() + 338000000).toISOString().slice(0, 10)
                },
                {
                    title: 'Data Update...',
                    className: 'badge bg-purple',
                    start: new Date(Date.now() - 338000000).toISOString().slice(0, 10)
                },
                {
                    title: 'Meeting with Team Dev',
                    className: 'badge bg-dark',
                    start: new Date(Date.now() + 68000000).toISOString().slice(0, 10)
                },
                {
                    title: 'Design System',
                    className: 'badge bg-danger',
                    start: new Date(Date.now() + 88000000).toISOString().slice(0, 10)
                },
            ],
            eventClick: function (info) {
                // Open modal
                var el = document.querySelector('#event_modal');
                if (el && typeof bootstrap !== 'undefined') {
                    (bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el)).show();
                }

                // Populate modal with event details
                var titleEl = document.getElementById('eventTitle');
                if (titleEl) {
                    titleEl.innerText = info.event.title;
                }
            },
            editable: true,
            droppable: true, // Enable drag and drop
            drop: function (info) {
                console.log('Event dropped');
            },
            eventReceive: function (info) {
                console.log('Event added', info.event.title);
            }
        });
        calendar.render();
    }

    // Calendar 2 (#calendar1)
    var calendar1El = document.getElementById('calendar1');
    if (calendar1El) {
        var TODAY = new Date().toISOString().slice(0, 10);

        var calendar1 = new FullCalendar.Calendar(calendar1El, {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },
            height: 500,
            contentHeight: 580,
            aspectRatio: 3,
            views: {
                dayGridMonth: { buttonText: 'month' },
                timeGridWeek: { buttonText: 'week' },
                timeGridDay: { buttonText: 'day' }
            },
            initialView: 'dayGridMonth',
            initialDate: TODAY,
            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            navLinks: true,
            events: [
                {
                    title: 'All Day Event',
                    start: new Date(Date.now() - 168000000).toISOString().slice(0, 10),
                    backgroundColor: '#FDE9ED'
                },
                {
                    id: 1000,
                    title: 'Repeating Event',
                    start: new Date(Date.now() - 338000000).toISOString().slice(0, 10)
                },
                {
                    title: 'Meeting',
                    start: new Date(Date.now() - 338000000).toISOString().slice(0, 10)
                },
                {
                    title: 'Click for Google',
                    start: new Date(Date.now() + 68000000).toISOString().slice(0, 10),
                    className: "bg-secondary text-white"
                }
            ]
        });
        calendar1.render();
    }
});
