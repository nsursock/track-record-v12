import { Calendar } from 'fullcalendar'

export default function () {
    return {
        showModal: false,
        modalTitle: '',
        eventTitle: '',
        selectedEvent: null,
        selectedDateInfo: null,
        calendar: null,
        tasks: [], // Start with empty array, will be populated from YAML

        // Fetch tasks from YAML data
        async fetchTasks() {
            try {
                // Try to load tasks data directly 
                const tasksData = {
                    "tasks": [
                        {
                            "title": "MVP Launch",
                            "start": "2025-06-14",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "🚀 Launch Day Checklist:\n- Final system health check\n- Team on standby\n- Marketing push activation\n- Social media live\n- Analytics monitoring\n- Support team ready\n- Backup systems verified",
                                "priority": "Critical",
                                "dependencies": ["Content & Marketing Ready", "Technical Infrastructure Complete"]
                            }
                        },
                        {
                            "title": "Content & Marketing Ready",
                            "start": "2025-06-12",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "📝 Content & Marketing Checklist:\n- All launch content reviewed and approved\n- SEO optimization complete\n- Social media posts scheduled\n- Email sequences ready\n- Press kit prepared\n- Launch announcements drafted\n- Analytics tracking verified",
                                "priority": "High",
                                "dependencies": ["Technical Infrastructure Complete"]
                            }
                        },
                        {
                            "title": "Technical Infrastructure Complete",
                            "start": "2025-06-10",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "🔧 Technical Checklist:\n- All systems tested and verified\n- Security audit complete\n- Performance optimization done\n- Backup systems in place\n- Monitoring tools configured\n- Error tracking set up\n- Load balancing ready",
                                "priority": "High",
                                "dependencies": ["Core Features Complete"]
                            }
                        },
                        {
                            "title": "Community & Social Ready",
                            "start": "2025-06-08",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "👥 Community Checklist:\n- Social media profiles optimized\n- Community guidelines established\n- Moderation tools configured\n- Engagement strategy ready\n- Content calendar finalized\n- Community managers briefed\n- Feedback channels set up",
                                "priority": "Medium",
                                "dependencies": ["Core Features Complete"]
                            }
                        },
                        {
                            "title": "Core Features Complete",
                            "start": "2025-06-06",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "⚙️ Core Features Checklist:\n- All MVP features implemented\n- User flows tested\n- Core functionality verified\n- Performance benchmarks met\n- Security measures in place\n- Documentation updated\n- API endpoints ready",
                                "priority": "High",
                                "dependencies": ["Initial Strategy Complete"]
                            }
                        },
                        {
                            "title": "Initial Strategy Complete",
                            "start": "2025-06-04",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "🎯 Strategy Checklist:\n- Target audience defined\n- Value proposition clear\n- Content strategy outlined\n- Marketing channels selected\n- Growth metrics established\n- Success criteria defined\n- Resource allocation planned",
                                "priority": "Medium",
                                "dependencies": ["Project Kickoff"]
                            }
                        },
                        {
                            "title": "Project Kickoff",
                            "start": "2025-06-03",
                            "classNames": ["fc-event-error"],
                            "extendedProps": {
                                "notes": "🚀 Kickoff Checklist:\n- Team assembled and briefed\n- Project scope defined\n- Timeline established\n- Resources allocated\n- Communication channels set up\n- Tools and access configured\n- Initial goals set",
                                "priority": "High",
                                "dependencies": []
                            }
                        },
                        {
                            "title": "Strategic Planning: Define core mission and target audience personas",
                            "start": "2025-06-03T02:00:00",
                            "end": "2025-06-03T04:00:00",
                            "classNames": ["fc-event-primary"],
                            "extendedProps": {
                                "notes": "Key Deliverables:\n- Mission statement\n- Target audience personas\n- Value proposition\n- Market positioning\n- Success metrics\n- Competitive analysis",
                                "priority": "High",
                                "estimatedHours": 2
                            }
                        },
                        {
                            "title": "Platform Setup: Configure CMS and deploy initial site structure",
                            "start": "2025-06-03T08:00:00",
                            "end": "2025-06-03T11:00:00",
                            "classNames": ["fc-event-info"],
                            "extendedProps": {
                                "notes": "Technical Setup:\n- CMS configuration\n- Site structure\n- Basic templates\n- Navigation setup\n- SEO foundation\n- Analytics integration",
                                "priority": "High",
                                "estimatedHours": 3
                            }
                        },
                        {
                            "title": "Content Strategy: Draft 3 pillar articles and newsletter framework",
                            "start": "2025-06-03T19:00:00",
                            "end": "2025-06-03T22:00:00",
                            "classNames": ["fc-event-success"],
                            "extendedProps": {
                                "notes": "Content Planning:\n- Pillar article outlines\n- Newsletter structure\n- Content calendar\n- Topic clusters\n- Keyword research\n- Content guidelines",
                                "priority": "High",
                                "estimatedHours": 3
                            }
                        },
                        {
                            "title": "Growth Planning: Set up analytics and conversion tracking",
                            "start": "2025-06-04T02:00:00",
                            "end": "2025-06-04T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Community Building: Create and optimize social media profiles",
                            "start": "2025-06-04T08:00:00",
                            "end": "2025-06-04T11:00:00",
                            "classNames": ["fc-event-secondary"]
                        },
                        {
                            "title": "Content Creation: Write and polish first pillar article",
                            "start": "2025-06-04T19:00:00",
                            "end": "2025-06-04T22:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Technical Setup: Implement newsletter system and automation",
                            "start": "2025-06-05T02:00:00",
                            "end": "2025-06-05T04:00:00",
                            "classNames": ["fc-event-info"]
                        },
                        {
                            "title": "Content Planning: Create 4-week editorial calendar",
                            "start": "2025-06-05T08:00:00",
                            "end": "2025-06-05T11:00:00",
                            "classNames": ["fc-event-success"]
                        },
                        {
                            "title": "Growth Strategy: Research and implement SEO best practices",
                            "start": "2025-06-05T19:00:00",
                            "end": "2025-06-05T22:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Content Creation: Draft second pillar article",
                            "start": "2025-06-06T02:00:00",
                            "end": "2025-06-06T04:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Community Engagement: Plan and schedule first social media campaign",
                            "start": "2025-06-06T08:00:00",
                            "end": "2025-06-06T11:00:00",
                            "classNames": ["fc-event-secondary"]
                        },
                        {
                            "title": "Technical Optimization: Implement performance improvements",
                            "start": "2025-06-06T19:00:00",
                            "end": "2025-06-06T22:00:00",
                            "classNames": ["fc-event-info"]
                        },
                        {
                            "title": "Final Testing: End-to-end testing and bug fixes",
                            "start": "2025-06-07T02:00:00",
                            "end": "2025-06-07T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Content Refinement: Polish and optimize existing articles",
                            "start": "2025-06-07T08:00:00",
                            "end": "2025-06-07T11:00:00",
                            "classNames": ["fc-event-success"]
                        },
                        {
                            "title": "Growth Tactics: Implement A/B testing and conversion optimization",
                            "start": "2025-06-07T19:00:00",
                            "end": "2025-06-07T22:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Final Review: Audit all systems and content for launch",
                            "start": "2025-06-08T02:00:00",
                            "end": "2025-06-08T04:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Launch Prep: Finalize all launch materials and checklists",
                            "start": "2025-06-08T08:00:00",
                            "end": "2025-06-08T11:00:00",
                            "classNames": ["fc-event-info"]
                        },
                        {
                            "title": "Community Activation: Prepare launch announcement and outreach",
                            "start": "2025-06-08T19:00:00",
                            "end": "2025-06-08T22:00:00",
                            "classNames": ["fc-event-secondary"]
                        },
                        {
                            "title": "Performance Testing: Load and stress testing",
                            "start": "2025-06-09T02:00:00",
                            "end": "2025-06-09T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Content Deployment: Push final content to staging",
                            "start": "2025-06-09T08:00:00",
                            "end": "2025-06-09T11:00:00",
                            "classNames": ["fc-event-info"]
                        },
                        {
                            "title": "Launch Sequence: Dry run of launch process",
                            "start": "2025-06-09T19:00:00",
                            "end": "2025-06-09T22:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Final Security Audit: Penetration testing and security checks",
                            "start": "2025-06-10T02:00:00",
                            "end": "2025-06-10T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "SEO Optimization: Final keyword and meta optimization",
                            "start": "2025-06-10T08:00:00",
                            "end": "2025-06-10T11:00:00",
                            "classNames": ["fc-event-success"]
                        },
                        {
                            "title": "Social Media: Finalize all launch posts and schedules",
                            "start": "2025-06-10T19:00:00",
                            "end": "2025-06-10T22:00:00",
                            "classNames": ["fc-event-secondary"]
                        },
                        {
                            "title": "Launch Checklist: Final verification of all systems",
                            "start": "2025-06-11T02:00:00",
                            "end": "2025-06-11T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Content Deployment: Push to production",
                            "start": "2025-06-11T08:00:00",
                            "end": "2025-06-11T11:00:00",
                            "classNames": ["fc-event-info"]
                        },
                        {
                            "title": "Launch Communications: Finalize all announcements",
                            "start": "2025-06-11T19:00:00",
                            "end": "2025-06-11T22:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Final Systems Check: Last-minute verification",
                            "start": "2025-06-12T02:00:00",
                            "end": "2025-06-12T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Launch Team Briefing: Final coordination meeting",
                            "start": "2025-06-12T08:00:00",
                            "end": "2025-06-12T11:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Pre-launch Marketing: Final promotional push",
                            "start": "2025-06-12T19:00:00",
                            "end": "2025-06-12T22:00:00",
                            "classNames": ["fc-event-secondary"]
                        },
                        {
                            "title": "Launch Day Prep: Final readiness check",
                            "start": "2025-06-13T02:00:00",
                            "end": "2025-06-13T04:00:00",
                            "classNames": ["fc-event-warning"]
                        },
                        {
                            "title": "Launch Day Prep: Team coordination",
                            "start": "2025-06-13T08:00:00",
                            "end": "2025-06-13T11:00:00",
                            "classNames": ["fc-event-primary"]
                        },
                        {
                            "title": "Launch Day Prep: Final system checks",
                            "start": "2025-06-13T19:00:00",
                            "end": "2025-06-13T22:00:00",
                            "classNames": ["fc-event-info"]
                        }
                    ]
                };

                this.tasks = tasksData.tasks;
            } catch (error) {
                console.warn('Could not load tasks data, using fallback tasks');
                // Fallback tasks if loading fails
                this.tasks = [
                    {
                        title: 'Define the mission, voice, and target reader',
                        start: '2025-06-03T08:00:00',
                        end: '2025-06-03T11:00:00',
                        classNames: ['fc-event-primary']
                    }
                ];
            }
        },

        async initCalendar() {
            // Load tasks first
            await this.fetchTasks();

            const self = this;
            const calendarEl = document.getElementById('calendar-custom');

            this.calendar = new Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                initialDate: new Date().toISOString().split('T')[0],
                editable: true,
                selectable: true,
                headerToolbar: {
                    left: 'prev,next title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                },
                buttonText: {
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    list: 'List'
                },
                events: self.tasks, // Use tasks loaded from YAML

                select: function (info) {
                    self.selectedEvent = null;
                    self.selectedDateInfo = info;
                    self.modalTitle = self.formatDate(info.start);
                    self.eventTitle = '';
                    self.showModal = true;
                },
                eventClick: function (info) {
                    self.selectedEvent = info.event;
                    self.modalTitle = self.formatDate(info.event.start);
                    self.eventTitle = info.event.title;
                    self.showModal = true;
                }
            });

            this.calendar.render();
        },

        formatDate(date) {
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        },

        closeModal() {
            this.showModal = false;
            this.selectedEvent = null;
            this.selectedDateInfo = null;
            this.eventTitle = '';
        },

        saveEvent() {
            if (this.eventTitle) {
                if (this.selectedEvent) {
                    this.selectedEvent.setProp('title', this.eventTitle);
                } else if (this.selectedDateInfo) {
                    this.calendar.addEvent({
                        title: this.eventTitle,
                        start: this.selectedDateInfo.startStr,
                        end: this.selectedDateInfo.endStr,
                        allDay: true,
                        classNames: ['fc-event-primary']
                    });
                }
                this.closeModal();
            }
        }
    }
}