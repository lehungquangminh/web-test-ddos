// Initialize Socket.IO connection
const socket = io();

// DOM elements
const streamToggle = document.getElementById('streamToggle');
const ipFilter = document.getElementById('ipFilter');
const topIpsTable = document.getElementById('topIpsTable').querySelector('tbody');
const logsTable = document.getElementById('logsTable').querySelector('tbody');
const rpsChart = new Chart(document.getElementById('rpsChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Requests per Second',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        animation: false
    }
});

// Event listeners
streamToggle.addEventListener('change', () => {
    socket.emit('toggle-stream', streamToggle.checked);
});

ipFilter.addEventListener('input', () => {
    socket.emit('filter-ip', ipFilter.value);
});

// Socket event handlers
socket.on('initial-stats', (stats) => {
    updateTopIPs(stats.topIPs);
    updateRequestsGraph(stats.requestsOverTime);
    updateLogs(stats.lastLogs);
});

socket.on('stats-update', (stats) => {
    if (streamToggle.checked) {
        updateTopIPs(stats.topIPs);
        updateRequestsGraph(stats.requestsOverTime);
        updateLogs(stats.lastLogs);
    }
});

// Update functions
function updateTopIPs(topIPs) {
    const sortedIPs = Array.from(topIPs)
        .sort((a, b) => b[1] - a[1])
        .filter(([ip]) => !ipFilter.value || ip.includes(ipFilter.value));

    topIpsTable.innerHTML = sortedIPs
        .map(([ip, count]) => `
            <tr>
                <td>${ip}</td>
                <td>${count}</td>
            </tr>
        `).join('');
}

function updateRequestsGraph(requestsOverTime) {
    const timeLabels = requestsOverTime.map(r => 
        new Date(r.timestamp).toLocaleTimeString()
    );
    const counts = requestsOverTime.map(r => r.count);

    rpsChart.data.labels = timeLabels;
    rpsChart.data.datasets[0].data = counts;
    rpsChart.update();
}

function updateLogs(logs) {
    const filteredLogs = logs.filter(log => 
        !ipFilter.value || log.ip.includes(ipFilter.value)
    );

    logsTable.innerHTML = filteredLogs
        .map(log => `
            <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.ip}</td>
                <td>${log.method}</td>
                <td>${log.url}</td>
                <td>${log.latency}</td>
                <td>${log.payloadSize}</td>
            </tr>
        `).join('');
}
