/**
 * Visualization Module - Renders wheel-of-life charts using Chart.js
 */

const WheelChart = {
    chart: null,

    /**
     * Categories and labels for the wheel
     */
    categories: {
        health: ['Body', 'Mind', 'Soul'],
        relationships: ['Friends', 'Romance', 'Family'],
        work: ['Mission', 'Money', 'Growth']
    },

    labels: ['Body', 'Mind', 'Soul', 'Friends', 'Romance', 'Family', 'Mission', 'Money', 'Growth'],

    colors: {
        health: 'rgba(76, 175, 80, 0.6)',      // Green
        relationships: 'rgba(33, 150, 243, 0.6)', // Blue
        work: 'rgba(255, 152, 0, 0.6)'          // Orange
    },

    /**
     * Renders the wheel-of-life radar chart
     * @param {Object} ratings - Object with ratings for each category
     */
    render(ratings) {
        const ctx = document.getElementById('wheel-chart');
        if (!ctx) {
            console.error('Canvas element not found');
            return;
        }

        // Extract ratings in correct order
        const data = [
            ratings.body,
            ratings.mind,
            ratings.soul,
            ratings.friends,
            ratings.romance,
            ratings.family,
            ratings.mission,
            ratings.money,
            ratings.growth
        ];

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Current Ratings',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2,
                            font: {
                                size: 12
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.r + '/10';
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Renders a comparison chart showing current vs previous entry
     * @param {Object} currentRatings - Current ratings
     * @param {Object} previousRatings - Previous ratings
     */
    renderComparison(currentRatings, previousRatings) {
        const ctx = document.getElementById('comparison-chart');
        if (!ctx) {
            console.error('Comparison canvas element not found');
            return;
        }

        const currentData = [
            currentRatings.body, currentRatings.mind, currentRatings.soul,
            currentRatings.friends, currentRatings.romance, currentRatings.family,
            currentRatings.mission, currentRatings.money, currentRatings.growth
        ];

        const previousData = [
            previousRatings.body, previousRatings.mind, previousRatings.soul,
            previousRatings.friends, previousRatings.romance, previousRatings.family,
            previousRatings.mission, previousRatings.money, previousRatings.growth
        ];

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: 'Current',
                        data: currentData,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Previous',
                        data: previousData,
                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                        borderColor: 'rgba(156, 163, 175, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });
    },

    /**
     * Renders a trend chart showing changes over time
     * @param {Array} entries - Array of entry objects
     * @param {string} category - Category to show trend for (e.g., 'body', 'mind')
     */
    renderTrend(entries, category) {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) {
            console.error('Trend canvas element not found');
            return;
        }

        const labels = entries.map(e => new Date(e.timestamp).toLocaleDateString());
        const data = entries.map(e => e.ratings[category]);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: category.charAt(0).toUpperCase() + category.slice(1),
                    data: data,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    },

    /**
     * Renders all categories trend chart showing all 9 areas over time
     * @param {Array} entries - Array of entry objects
     * @param {string} canvasId - Canvas element ID
     */
    renderAllTrends(entries, canvasId = 'trends-chart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Trends canvas element not found: ' + canvasId);
            return;
        }

        if (entries.length === 0) {
            return;
        }

        const labels = entries.map(e => new Date(e.timestamp).toLocaleDateString());

        // Color palette for different categories
        const categoryColors = {
            body: { border: 'rgba(76, 175, 80, 1)', bg: 'rgba(76, 175, 80, 0.1)' },
            mind: { border: 'rgba(139, 195, 74, 1)', bg: 'rgba(139, 195, 74, 0.1)' },
            soul: { border: 'rgba(205, 220, 57, 1)', bg: 'rgba(205, 220, 57, 0.1)' },
            friends: { border: 'rgba(33, 150, 243, 1)', bg: 'rgba(33, 150, 243, 0.1)' },
            romance: { border: 'rgba(63, 81, 181, 1)', bg: 'rgba(63, 81, 181, 0.1)' },
            family: { border: 'rgba(103, 58, 183, 1)', bg: 'rgba(103, 58, 183, 0.1)' },
            mission: { border: 'rgba(255, 152, 0, 1)', bg: 'rgba(255, 152, 0, 0.1)' },
            money: { border: 'rgba(255, 87, 34, 1)', bg: 'rgba(255, 87, 34, 0.1)' },
            growth: { border: 'rgba(233, 30, 99, 1)', bg: 'rgba(233, 30, 99, 0.1)' }
        };

        const datasets = this.labels.map(label => {
            const key = label.toLowerCase();
            const color = categoryColors[key];
            return {
                label: label,
                data: entries.map(e => e.ratings[key]),
                borderColor: color.border,
                backgroundColor: color.bg,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            };
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: 'Rating'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '/10';
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Renders category averages trend (Health, Relationships, Work)
     * @param {Array} entries - Array of entry objects
     * @param {string} canvasId - Canvas element ID
     */
    renderCategoryAveragesTrend(entries, canvasId = 'category-trends-chart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error('Category trends canvas element not found: ' + canvasId);
            return;
        }

        if (entries.length === 0) {
            return;
        }

        const labels = entries.map(e => new Date(e.timestamp).toLocaleDateString());

        const datasets = [
            {
                label: 'Health',
                data: entries.map(e => this.getCategoryAverage(e.ratings, 'health')),
                borderColor: 'rgba(76, 175, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                tension: 0.3,
                borderWidth: 3,
                fill: true
            },
            {
                label: 'Relationships',
                data: entries.map(e => this.getCategoryAverage(e.ratings, 'relationships')),
                borderColor: 'rgba(33, 150, 243, 1)',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                tension: 0.3,
                borderWidth: 3,
                fill: true
            },
            {
                label: 'Work',
                data: entries.map(e => this.getCategoryAverage(e.ratings, 'work')),
                borderColor: 'rgba(255, 152, 0, 1)',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                tension: 0.3,
                borderWidth: 3,
                fill: true
            }
        ];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: 'Average Rating'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '/10';
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Calculates average rating for a major category
     * @param {Object} ratings - Ratings object
     * @param {string} category - Major category (health, relationships, work)
     * @returns {number} - Average rating
     */
    getCategoryAverage(ratings, category) {
        const subcategories = this.categories[category];
        const values = subcategories.map(sc => ratings[sc.toLowerCase()]);
        return values.reduce((a, b) => a + b, 0) / values.length;
    },

    /**
     * Gets overall life balance score (0-10)
     * @param {Object} ratings - Ratings object
     * @returns {number} - Overall balance score
     */
    getBalanceScore(ratings) {
        const allValues = Object.values(ratings);
        const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
        const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = better balance
        // Convert to 0-10 scale (10 being perfectly balanced)
        const balanceScore = Math.max(0, 10 - stdDev);
        return Math.round(balanceScore * 10) / 10;
    },

    /**
     * Calculates average ratings over a time period
     * @param {Array} entries - Array of entry objects
     * @param {number} days - Number of days to include (null for all)
     * @returns {Object} - Object with average ratings for each category
     */
    calculateAverages(entries, days = null) {
        if (entries.length === 0) {
            return null;
        }

        // Filter entries by time period if specified
        let filteredEntries = entries;
        if (days !== null) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filteredEntries = entries.filter(e => new Date(e.timestamp) >= cutoffDate);
        }

        if (filteredEntries.length === 0) {
            return null;
        }

        // Calculate averages for each category
        const averages = {};
        this.labels.forEach(label => {
            const key = label.toLowerCase();
            const sum = filteredEntries.reduce((total, entry) => total + entry.ratings[key], 0);
            averages[key] = Math.round((sum / filteredEntries.length) * 10) / 10;
        });

        return averages;
    },

    /**
     * Calculates category averages (Health, Relationships, Work)
     * @param {Array} entries - Array of entry objects
     * @param {number} days - Number of days to include (null for all)
     * @returns {Object} - Object with category averages
     */
    calculateCategoryAverages(entries, days = null) {
        const averages = this.calculateAverages(entries, days);
        if (!averages) {
            return null;
        }

        return {
            health: this.getCategoryAverage(averages, 'health'),
            relationships: this.getCategoryAverage(averages, 'relationships'),
            work: this.getCategoryAverage(averages, 'work'),
            overall: Object.values(averages).reduce((a, b) => a + b, 0) / 9
        };
    },

    /**
     * Filters entries by date range
     * @param {Array} entries - Array of entry objects
     * @param {Date} startDate - Start date (inclusive)
     * @param {Date} endDate - End date (inclusive)
     * @returns {Array} - Filtered entries
     */
    filterByDateRange(entries, startDate, endDate) {
        if (!startDate && !endDate) {
            return entries;
        }

        return entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            const afterStart = !startDate || entryDate >= startDate;
            const beforeEnd = !endDate || entryDate <= endDate;
            return afterStart && beforeEnd;
        });
    }
};
