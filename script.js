 let currentResults = {};

        function parseFunction(funcStr) {
            try {
                // Replace common mathematical notation with proper error handling
                let processed = funcStr
                    .replace(/\^/g, '**')
                    .replace(/\bsin\b/g, 'Math.sin')
                    .replace(/\bcos\b/g, 'Math.cos')
                    .replace(/\btan\b/g, 'Math.tan')
                    .replace(/\bexp\b/g, 'Math.exp')
                    .replace(/\blog\b/g, 'Math.log')
                    .replace(/\bln\b/g, 'Math.log')
                    .replace(/\bsqrt\b/g, 'Math.sqrt')
                    .replace(/\babs\b/g, 'Math.abs')
                    .replace(/\bpi\b/g, 'Math.PI')
                    .replace(/\be\b/g, 'Math.E');

                // Create function with error handling for domain issues
                const func = new Function('x', `
                    try {
                        const result = ${processed};
                        if (isNaN(result) || !isFinite(result)) {
                            throw new Error('Domain error');
                        }
                        return result;
                    } catch (e) {
                        throw new Error('Evaluation error at x = ' + x);
                    }
                `);

                return func;
            } catch (error) {
                throw new Error('Format fungsi tidak valid. Gunakan notasi: x**2, sin(x), exp(x), log(x), sqrt(x)');
            }
        }

        function trapezoidMethod(f, a, b, n) {
            const h = (b - a) / n;
            let sum = f(a) + f(b);
            
            const steps = [];
            steps.push(`Lebar subinterval h = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`);
            steps.push(`Mulai dengan f(${a}) + f(${b}) = ${f(a).toFixed(6)} + ${f(b).toFixed(6)} = ${(f(a) + f(b)).toFixed(6)}`);
            
            for (let i = 1; i < n; i++) {
                const x = a + i * h;
                const fx = f(x);
                sum += 2 * fx;
                steps.push(`f(${x.toFixed(3)}) = ${fx.toFixed(6)}, dikalikan 2 = ${(2 * fx).toFixed(6)}`);
            }
            
            const result = (h / 2) * sum;
            steps.push(`Hasil = (${h.toFixed(6)} / 2) × ${sum.toFixed(6)} = ${result.toFixed(6)}`);
            
            return { result, steps };
        }

        function simpsonMethod(f, a, b, n) {
            if (n % 2 !== 0) n++; // Simpson memerlukan n genap
            
            const h = (b - a) / n;
            let sum = f(a) + f(b);
            
            const steps = [];
            steps.push(`Lebar subinterval h = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`);
            steps.push(`Mulai dengan f(${a}) + f(${b}) = ${f(a).toFixed(6)} + ${f(b).toFixed(6)} = ${(f(a) + f(b)).toFixed(6)}`);
            
            for (let i = 1; i < n; i++) {
                const x = a + i * h;
                const fx = f(x);
                const multiplier = i % 2 === 0 ? 2 : 4;
                sum += multiplier * fx;
                steps.push(`f(${x.toFixed(3)}) = ${fx.toFixed(6)}, dikalikan ${multiplier} = ${(multiplier * fx).toFixed(6)}`);
            }
            
            const result = (h / 3) * sum;
            steps.push(`Hasil = (${h.toFixed(6)} / 3) × ${sum.toFixed(6)} = ${result.toFixed(6)}`);
            
            return { result, steps, intervals: n };
        }

        function rectangleMethod(f, a, b, n) {
            const h = (b - a) / n;
            let sum = 0;
            
            const steps = [];
            steps.push(`Lebar subinterval h = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`);
            
            for (let i = 0; i < n; i++) {
                const x = a + i * h + h/2; // Midpoint
                const fx = f(x);
                sum += fx;
                steps.push(`f(${x.toFixed(3)}) = ${fx.toFixed(6)}`);
            }
            
            const result = h * sum;
            steps.push(`Hasil = ${h.toFixed(6)} × ${sum.toFixed(6)} = ${result.toFixed(6)}`);
            
            return { result, steps };
        }

        function calculateExact(funcStr, a, b) {
            // Simplified exact calculation for common functions
            try {
                if (funcStr === 'x^2' || funcStr === 'x**2') {
                    return (1/3) * (Math.pow(b, 3) - Math.pow(a, 3));
                } else if (funcStr === 'x') {
                    return 0.5 * (b*b - a*a);
                } else if (funcStr === '1') {
                    return b - a;
                }
                return null;
            } catch {
                return null;
            }
        }

        function calculateIntegral() {
            try {
                const funcStr = document.getElementById('functionInput').value;
                const a = parseFloat(document.getElementById('lowerBound').value);
                const b = parseFloat(document.getElementById('upperBound').value);
                const n = parseInt(document.getElementById('intervals').value);

                if (a >= b) {
                    throw new Error('Batas atas harus lebih besar dari batas bawah');
                }

                if (n < 2) {
                    throw new Error('Jumlah subinterval minimal 2');
                }

                // Special domain validation for common functions
                if (funcStr.includes('log') && a <= 0) {
                    throw new Error('Domain Error: log(x) memerlukan x > 0. Gunakan batas bawah > 0');
                }

                if (funcStr.includes('sqrt') && a < 0) {
                    throw new Error('Domain Error: sqrt(x) memerlukan x ≥ 0. Gunakan batas bawah ≥ 0');
                }

                if (funcStr.includes('1/x') && (a <= 0 && b >= 0)) {
                    throw new Error('Domain Error: 1/x memiliki diskontinuitas di x = 0');
                }

                const f = parseFunction(funcStr);
                
                // Test function with sample values to ensure it's valid
                const testPoints = [a, (a + b) / 2, b];
                for (const point of testPoints) {
                    try {
                        const result = f(point);
                        if (!isFinite(result) || isNaN(result)) {
                            throw new Error(`Fungsi tidak terdefinisi di x = ${point}`);
                        }
                    } catch (e) {
                        throw new Error(`Error evaluasi fungsi di x = ${point}: ${e.message}`);
                    }
                }

                // Calculate using different methods
                const trapezoid = trapezoidMethod(f, a, b, n);
                const simpson = simpsonMethod(f, a, b, n);
                const rectangle = rectangleMethod(f, a, b, n);
                const exact = calculateExact(funcStr, a, b);

                currentResults = {
                    trapezoid,
                    simpson,
                    rectangle,
                    exact,
                    function: funcStr,
                    bounds: [a, b],
                    intervals: n
                };

                displayResults();
                plotFunction(f, a, b, n);
                clearError();

            } catch (error) {
                showError(error.message);
                // Clear plot on error
                document.getElementById('plotContainer').innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #666;">
                        <h4>📊 Grafik akan muncul setelah perhitungan berhasil</h4>
                        <p>Perbaiki error di atas untuk melihat visualisasi</p>
                    </div>
                `;
            }
        }

        function displayResults() {
            const { trapezoid, simpson, rectangle, exact } = currentResults;
            
            const resultsHtml = `
                <div class="result-card">
                    <div class="result-value">${trapezoid.result.toFixed(6)}</div>
                    <div class="result-label">Metode Trapezoid</div>
                </div>
            `;

            const comparisonHtml = `
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Metode</th>
                            <th>Hasil</th>
                            <th>Error (jika diketahui)</th>
                            <th>Interval</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Trapezoid</td>
                            <td>${trapezoid.result.toFixed(6)}</td>
                            <td>${exact ? Math.abs(exact - trapezoid.result).toFixed(6) : 'N/A'}</td>
                            <td>${currentResults.intervals}</td>
                        </tr>
                        <tr>
                            <td>Simpson</td>
                            <td>${simpson.result.toFixed(6)}</td>
                            <td>${exact ? Math.abs(exact - simpson.result).toFixed(6) : 'N/A'}</td>
                            <td>${simpson.intervals}</td>
                        </tr>
                        <tr>
                            <td>Rectangle</td>
                            <td>${rectangle.result.toFixed(6)}</td>
                            <td>${exact ? Math.abs(exact - rectangle.result).toFixed(6) : 'N/A'}</td>
                            <td>${currentResults.intervals}</td>
                        </tr>
                        ${exact ? `
                        <tr style="background: #e8f5e8;">
                            <td><strong>Eksak</strong></td>
                            <td><strong>${exact.toFixed(6)}</strong></td>
                            <td><strong>0.000000</strong></td>
                            <td><strong>∞</strong></td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            `;

            document.getElementById('resultsContainer').innerHTML = resultsHtml;
            document.getElementById('comparisonContainer').innerHTML = comparisonHtml;
            
            showMethod('trapezoid');
        }

        function showMethod(method) {
            // Update active tab
            document.querySelectorAll('.method-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');

            // Show steps for selected method
            const methodData = currentResults[method];
            if (methodData) {
                const stepsHtml = methodData.steps.map((step, index) => `
                    <div class="step">
                        <h4>Langkah ${index + 1}</h4>
                        <p>${step}</p>
                    </div>
                `).join('');

                document.getElementById('stepsContainer').innerHTML = stepsHtml;

                // Update result card
                const resultCard = document.querySelector('.result-card');
                if (resultCard) {
                    resultCard.innerHTML = `
                        <div class="result-value">${methodData.result.toFixed(6)}</div>
                        <div class="result-label">Metode ${method.charAt(0).toUpperCase() + method.slice(1)}</div>
                    `;
                }
            }
        }

        function plotFunction(f, a, b, n) {
            try {
                const numPoints = 1000;
                const dx = (b - a) / numPoints;
                const x = [];
                const y = [];

                // Safe function evaluation with domain checking
                for (let i = 0; i <= numPoints; i++) {
                    const xi = a + i * dx;
                    try {
                        const yi = f(xi);
                        if (isFinite(yi) && !isNaN(yi)) {
                            x.push(xi);
                            y.push(yi);
                        }
                    } catch (e) {
                        // Skip problematic points
                        continue;
                    }
                }

                if (x.length === 0) {
                    throw new Error('Tidak ada titik valid dalam domain yang diberikan');
                }

                // Create trapezoid visualization with safe evaluation
                const h = (b - a) / n;
                const trapX = [];
                const trapY = [];

                for (let i = 0; i <= n; i++) {
                    const xi = a + i * h;
                    try {
                        const yi = f(xi);
                        if (isFinite(yi) && !isNaN(yi)) {
                            trapX.push(xi);
                            trapY.push(yi);
                        }
                    } catch (e) {
                        // Use zero for problematic points
                        trapX.push(xi);
                        trapY.push(0);
                    }
                }

                // Create trapezoid shapes with safe evaluation
                const shapes = [];
                for (let i = 0; i < n; i++) {
                    const x1 = a + i * h;
                    const x2 = a + (i + 1) * h;
                    try {
                        const y1 = f(x1);
                        const y2 = f(x2);
                        if (isFinite(y1) && isFinite(y2) && !isNaN(y1) && !isNaN(y2)) {
                            shapes.push({
                                type: 'rect',
                                x0: x1,
                                y0: 0,
                                x1: x2,
                                y1: Math.min(y1, y2),
                                fillcolor: 'rgba(79, 172, 254, 0.3)',
                                line: { color: 'rgba(79, 172, 254, 0.8)' }
                            });
                        }
                    } catch (e) {
                        // Skip problematic trapezoids
                        continue;
                    }
                }

                const trace1 = {
                    x: x,
                    y: y,
                    type: 'scatter',
                    mode: 'lines',
                    name: `f(x) = ${currentResults.function}`,
                    line: { color: '#667eea', width: 3 },
                    connectgaps: false
                };

                const trace2 = {
                    x: trapX,
                    y: trapY,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Titik Trapezoid',
                    line: { color: '#f5576c', width: 2 },
                    marker: { color: '#f5576c', size: 8 }
                };

                // Responsive layout configuration
                const isMobile = window.innerWidth <= 768;
                
                const layout = {
                    title: {
                        text: `Visualisasi Integral: f(x) = ${currentResults.function}`,
                        font: { size: isMobile ? 14 : 16 }
                    },
                    xaxis: { 
                        title: { text: 'x', font: { size: isMobile ? 12 : 14 } },
                        tickfont: { size: isMobile ? 10 : 12 }
                    },
                    yaxis: { 
                        title: { text: 'f(x)', font: { size: isMobile ? 12 : 14 } },
                        tickfont: { size: isMobile ? 10 : 12 }
                    },
                    shapes: shapes,
                    showlegend: !isMobile,
                    responsive: true,
                    margin: {
                        l: isMobile ? 40 : 60,
                        r: isMobile ? 20 : 40,
                        t: isMobile ? 40 : 60,
                        b: isMobile ? 40 : 60
                    },
                    legend: {
                        orientation: isMobile ? 'h' : 'v',
                        x: isMobile ? 0 : 1,
                        y: isMobile ? -0.2 : 1,
                        font: { size: isMobile ? 10 : 12 }
                    }
                };

                const config = {
                    responsive: true,
                    displayModeBar: !isMobile,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                    displaylogo: false
                };

                Plotly.newPlot('plotContainer', [trace1, trace2], layout, config);
            } catch (error) {
                document.getElementById('plotContainer').innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #d63031;">
                        <h4>❌ Error dalam membuat grafik</h4>
                        <p>${error.message}</p>
                        <p style="font-size: 0.9rem; opacity: 0.7;">
                            Tip: Periksa domain fungsi (mis: log(x) memerlukan x > 0)
                        </p>
                    </div>
                `;
            }
        }

        function showError(message) {
            document.getElementById('errorContainer').innerHTML = `
                <div class="error">
                    ⚠️ ${message}
                </div>
            `;
        }

        function clearError() {
            document.getElementById('errorContainer').innerHTML = '';
        }

        function exportResults() {
            if (!currentResults.trapezoid) {
                showError('Tidak ada hasil untuk diekspor. Silakan hitung terlebih dahulu.');
                return;
            }

            const data = {
                timestamp: new Date().toISOString(),
                function: currentResults.function,
                bounds: currentResults.bounds,
                intervals: currentResults.intervals,
                results: {
                    trapezoid: currentResults.trapezoid.result,
                    simpson: currentResults.simpson.result,
                    rectangle: currentResults.rectangle.result,
                    exact: currentResults.exact
                },
                errors: currentResults.exact ? {
                    trapezoid: Math.abs(currentResults.exact - currentResults.trapezoid.result),
                    simpson: Math.abs(currentResults.exact - currentResults.simpson.result),
                    rectangle: Math.abs(currentResults.exact - currentResults.rectangle.result)
                } : null
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `integral_results_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        // Initialize with default calculation
        window.onload = function() {
            calculateIntegral();
            
            // Add window resize listener for responsive plot
            window.addEventListener('resize', function() {
                if (currentResults.trapezoid) {
                    const funcStr = document.getElementById('functionInput').value;
                    const a = parseFloat(document.getElementById('lowerBound').value);
                    const b = parseFloat(document.getElementById('upperBound').value);
                    const n = parseInt(document.getElementById('intervals').value);
                    const f = parseFunction(funcStr);
                    
                    setTimeout(() => {
                        plotFunction(f, a, b, n);
                    }, 100);
                }
            });
        };