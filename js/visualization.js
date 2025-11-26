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
    }
};
