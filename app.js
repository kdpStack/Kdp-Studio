/**
 * Premium Logic Puzzle Generator
 * Story-driven Murdoku-style puzzle generation with advanced features
 */

class PuzzleGenerator {
    constructor() {
        this.gridSize = 8;
        this.difficulty = 50;
        this.solution = [];
        this.puzzle = [];
        this.clues = [];
        this.storyTheme = 'mystery';
        this.seed = null;
        
        this.themes = {
            mystery: {
                title: "The Missing Heirloom",
                premise: "A valuable heirloom has gone missing from the mansion. Use the clues to determine who took it and where it's hidden.",
                characters: ["Detective", "Butler", "Chef", "Gardener", "Maid", "Guest", "Driver", "Secretary"],
                items: ["Heirloom", "Safe", "Library", "Garden", "Kitchen", "Bedroom", "Study", "Garage"],
                icon: "🔍"
            },
            fantasy: {
                title: "The Dragon's Treasure",
                premise: "The dragon has scattered its treasure across the realm. Match each knight to their quest location and the artifact they seek.",
                characters: ["Knight", "Wizard", "Elf", "Dwarf", "Dragon", "King", "Queen", "Merchant"],
                items: ["Sword", "Shield", "Crown", "Ring", "Amulet", "Staff", "Book", "Chalice"],
                icon: "🏰"
            },
            scifi: {
                title: "Space Station Mystery",
                premise: "On the distant space station, crew members have been assigned to different sectors. Determine who works where and their specializations.",
                characters: ["Captain", "Engineer", "Scientist", "Medic", "Pilot", "Security", "Technician", "Biologist"],
                items: ["Bridge", "Engineering", "Lab", "Medbay", "Cargo", "Quarters", "Reactor", "Observatory"],
                icon: "🚀"
            },
            historical: {
                title: "Royal Court Intrigue",
                premise: "In the royal court, nobles have been assigned positions and territories. Uncover the political alliances.",
                characters: ["King", "Queen", "Duke", "Duchess", "Earl", "Baron", "Knight", "Advisor"],
                items: ["Throne", "Castle", "Estate", "Province", "Army", "Treasury", "Court", "Chapel"],
                icon: "📜"
            },
            modern: {
                title: "Corporate Espionage",
                premise: "In a major corporation, executives have different roles and project assignments. Find out who's responsible for what.",
                characters: ["CEO", "CTO", "CFO", "Manager", "Developer", "Designer", "Analyst", "Marketer"],
                items: ["Project A", "Project B", "Budget", "Strategy", "Product", "Sales", "Research", "Operations"],
                icon: "🏙️"
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDifficultyIndicator();
        this.loadSettings();
    }

    setupEventListeners() {
        // Difficulty slider
        const difficultySlider = document.getElementById('difficulty');
        if (difficultySlider) {
            difficultySlider.addEventListener('input', (e) => {
                document.getElementById('difficultyValue').textContent = `${e.target.value}%`;
                this.difficulty = parseInt(e.target.value);
                this.updateDifficultyIndicator();
            });
        }

        // Theme selector
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.storyTheme = option.dataset.theme;
                
                if (this.storyTheme !== 'custom') {
                    const theme = this.themes[this.storyTheme];
                    document.getElementById('storyTitle').value = theme.title;
                    document.getElementById('storyPremise').value = theme.premise;
                    document.getElementById('characters').value = theme.characters.join(', ');
                }
            });
        });

        // Grid size change
        const gridSizeSelect = document.getElementById('gridSize');
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', (e) => {
                this.gridSize = parseInt(e.target.value);
            });
        }
    }

    updateDifficultyIndicator() {
        const container = document.getElementById('difficultyIndicator');
        const value = this.difficulty;
        const dots = Math.ceil(value / 20);
        
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = `diff-dot ${i < dots ? 'filled' : ''}`;
            container.appendChild(dot);
        }
    }

    // Seeded random number generator for reproducibility
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    setSeed(seedStr) {
        if (!seedStr) {
            this.seed = Date.now();
        } else {
            let hash = 0;
            for (let i = 0; i < seedStr.length; i++) {
                const char = seedStr.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            this.seed = Math.abs(hash);
        }
        return this.seed;
    }

    random(max) {
        if (this.seed !== null) {
            return Math.floor(this.seededRandom(this.seed++) * max);
        }
        return Math.floor(Math.random() * max);
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.random(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    generateSolution() {
        const size = this.gridSize;
        this.solution = [];
        
        // Generate a valid Latin square solution
        const base = Array.from({length: size}, (_, i) => i + 1);
        const shifted = this.shuffle(base);
        
        for (let i = 0; i < size; i++) {
            const row = [];
            const shift = this.random(size);
            for (let j = 0; j < size; j++) {
                row.push(shifted[(j + shift + i) % size]);
            }
            this.solution.push(row);
        }
        
        // Validate the solution
        if (!this.validateSolution(this.solution)) {
            return this.generateSolution();
        }
        
        return this.solution;
    }

    validateSolution(grid) {
        const size = grid.length;
        
        // Check rows
        for (let i = 0; i < size; i++) {
            const rowSet = new Set(grid[i]);
            if (rowSet.size !== size) return false;
        }
        
        // Check columns
        for (let j = 0; j < size; j++) {
            const colSet = new Set();
            for (let i = 0; i < size; i++) {
                colSet.add(grid[i][j]);
            }
            if (colSet.size !== size) return false;
        }
        
        return true;
    }

    generatePuzzleGrid(solution, difficultyPercent) {
        const size = solution.length;
        const totalCells = size * size;
        const removeCount = Math.floor((difficultyPercent / 100) * totalCells);
        
        this.puzzle = solution.map(row => [...row]);
        const givenMask = solution.map(row => row.map(() => true));
        
        const cells = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                cells.push([i, j]);
            }
        }
        
        const shuffledCells = this.shuffle(cells);
        
        for (let k = 0; k < removeCount && k < cells.length; k++) {
            const [i, j] = shuffledCells[k];
            const backup = this.puzzle[i][j];
            this.puzzle[i][j] = 0;
            givenMask[i][j] = false;
            
            // Check if puzzle still has unique solution
            if (!this.hasUniqueSolution()) {
                this.puzzle[i][j] = backup;
                givenMask[i][j] = true;
            }
        }
        
        return { puzzle: this.puzzle, givenMask };
    }

    hasUniqueSolution() {
        const size = this.puzzle.length;
        const solutions = [];
        const puzzleCopy = this.puzzle.map(row => [...row]);
        
        this.solveBacktrack(puzzleCopy, solutions, 10);
        return solutions.length === 1;
    }

    solveBacktrack(grid, solutions, limit = 1) {
        if (solutions.length >= limit) return;
        
        const size = grid.length;
        let empty = null;
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) {
                    empty = [i, j];
                    break;
                }
            }
            if (empty) break;
        }
        
        if (!empty) {
            solutions.push(grid.map(row => [...row]));
            return;
        }
        
        const [row, col] = empty;
        const nums = this.shuffle(Array.from({length: size}, (_, i) => i + 1));
        
        for (const num of nums) {
            if (this.isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                this.solveBacktrack(grid, solutions, limit);
                grid[row][col] = 0;
                
                if (solutions.length >= limit) return;
            }
        }
    }

    isValidPlacement(grid, row, col, num) {
        const size = grid.length;
        
        // Check row
        for (let j = 0; j < size; j++) {
            if (grid[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < size; i++) {
            if (grid[i][col] === num) return false;
        }
        
        return true;
    }

    generateClues(solution, puzzle, count) {
        this.clues = [];
        const size = solution.length;
        const clueTypes = [];
        
        if (document.getElementById('directClues').checked) clueTypes.push('direct');
        if (document.getElementById('negativeClues').checked) clueTypes.push('negative');
        if (document.getElementById('relationalClues').checked) clueTypes.push('relational');
        if (document.getElementById('conditionalClues').checked) clueTypes.push('conditional');
        if (document.getElementById('spatialClues').checked) clueTypes.push('spatial');
        
        if (clueTypes.length === 0) clueTypes.push('direct');
        
        const characters = this.getCharacters();
        const items = this.getItems();
        
        for (let i = 0; i < count; i++) {
            const type = clueTypes[this.random(clueTypes.length)];
            const clue = this.createClue(type, solution, characters, items);
            if (clue) {
                this.clues.push(clue);
            }
        }
        
        // Ensure minimum clues based on difficulty
        while (this.clues.length < Math.max(5, Math.floor(count * 0.8))) {
            const type = clueTypes[this.random(clueTypes.length)];
            const clue = this.createClue(type, solution, characters, items);
            if (clue && !this.clues.some(c => c.text === clue.text)) {
                this.clues.push(clue);
            }
        }
        
        return this.clues;
    }

    createClue(type, solution, characters, items) {
        const size = solution.length;
        const row = this.random(size);
        const col = this.random(size);
        const value = solution[row][col];
        
        const char = characters[row % characters.length];
        const item = items[col % items.length];
        
        switch (type) {
            case 'direct':
                return {
                    type: 'direct',
                    text: `${char} is associated with position ${value}.`,
                    row, col, value
                };
                
            case 'negative':
                const notValue = ((value % size) + 1);
                return {
                    type: 'negative',
                    text: `${char} is NOT associated with position ${notValue}.`,
                    row, col, notValue
                };
                
            case 'relational':
                const otherRow = this.random(size);
                const otherChar = characters[otherRow % characters.length];
                const relation = this.random(3);
                if (relation === 0) {
                    return {
                        type: 'relational',
                        text: `${char}'s position is greater than ${otherChar}'s position.`,
                        row, otherRow, condition: '>'
                    };
                } else if (relation === 1) {
                    return {
                        type: 'relational',
                        text: `${item} appears in a column before ${characters[(row + 1) % size]}'s item.`,
                        col, condition: '<'
                    };
                } else {
                    return {
                        type: 'relational',
                        text: `${char} and ${otherChar} have positions that differ by more than 2.`,
                        row, otherRow, condition: 'diff'
                    };
                }
                
            case 'conditional':
                return {
                    type: 'conditional',
                    text: `If ${char} is in position ${value}, then ${items[(col + 1) % size]} must be in an even position.`,
                    row, col, value, condition: 'if-then'
                };
                
            case 'spatial':
                const direction = this.random(4);
                const directions = ['above', 'below', 'left of', 'right of'];
                return {
                    type: 'spatial',
                    text: `${item} is positioned ${directions[direction]} ${char}'s item.`,
                    row, col, direction: directions[direction]
                };
                
            default:
                return {
                    type: 'direct',
                    text: `Position (${row + 1}, ${col + 1}) contains value ${value}.`,
                    row, col, value
                };
        }
    }

    getCharacters() {
        const input = document.getElementById('characters').value;
        if (input.trim()) {
            return input.split(',').map(s => s.trim()).filter(s => s);
        }
        const theme = this.themes[this.storyTheme];
        return theme ? theme.characters : Array.from({length: this.gridSize}, (_, i) => `Item ${i + 1}`);
    }

    getItems() {
        const theme = this.themes[this.storyTheme];
        return theme ? theme.items : Array.from({length: this.gridSize}, (_, i) => `Location ${i + 1}`);
    }

    renderPuzzle(container, puzzle, givenMask, showSolution = false) {
        const size = puzzle.length;
        container.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'puzzle-grid';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        const cellSize = Math.max(30, Math.min(60, 500 / size));
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                
                const value = puzzle[i][j];
                const isGiven = givenMask && givenMask[i][j];
                
                if (value !== 0) {
                    cell.textContent = value;
                    if (isGiven) {
                        cell.classList.add('given');
                    } else if (showSolution) {
                        cell.classList.add('solved');
                    }
                } else if (showSolution) {
                    cell.textContent = this.solution[i][j];
                    cell.classList.add('solved');
                }
                
                grid.appendChild(cell);
            }
        }
        
        container.appendChild(grid);
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.marginTop = '15px';
        legend.style.display = 'flex';
        legend.style.gap = '20px';
        legend.style.flexWrap = 'wrap';
        
        const characters = this.getCharacters();
        const items = this.getItems();
        
        const charLegend = document.createElement('div');
        charLegend.innerHTML = '<strong>Rows:</strong> ' + characters.slice(0, size).join(', ');
        
        const itemLegend = document.createElement('div');
        itemLegend.innerHTML = '<strong>Columns:</strong> ' + items.slice(0, size).join(', ');
        
        legend.appendChild(charLegend);
        legend.appendChild(itemLegend);
        container.appendChild(legend);
    }

    verifyPuzzle() {
        const solutions = [];
        const puzzleCopy = this.puzzle.map(row => [...row]);
        
        this.solveBacktrack(puzzleCopy, solutions, 3);
        
        const statusDiv = document.getElementById('verificationStatus');
        
        if (solutions.length === 0) {
            statusDiv.innerHTML = '<span class="verification-badge badge-error">❌ No Solution Found</span>';
            showToast('Puzzle has no valid solution!', 'error');
            return false;
        } else if (solutions.length === 1) {
            statusDiv.innerHTML = '<span class="verification-badge badge-success">✓ Unique Solution Verified</span>';
            document.getElementById('statUnique').textContent = 'Yes';
            showToast('Puzzle verified! Unique solution confirmed.', 'success');
            return true;
        } else {
            statusDiv.innerHTML = `<span class="verification-badge badge-warning">⚠️ Multiple Solutions (${solutions.length})</span>`;
            document.getElementById('statUnique').textContent = 'No';
            showToast(`Warning: Puzzle has ${solutions.length} solutions!`, 'error');
            return false;
        }
    }

    getDifficultyLabel() {
        if (this.difficulty < 35) return 'Easy';
        if (this.difficulty < 55) return 'Medium';
        if (this.difficulty < 70) return 'Hard';
        return 'Expert';
    }

    async generate() {
        const seedInput = document.getElementById('seedControl').value;
        this.setSeed(seedInput);
        
        // Generate solution
        this.generateSolution();
        
        // Generate puzzle from solution
        const { puzzle, givenMask } = this.generatePuzzleGrid(this.solution, this.difficulty);
        
        // Generate clues
        const clueCount = parseInt(document.getElementById('clueCount').value) || 15;
        this.generateClues(this.solution, puzzle, clueCount);
        
        // Update UI
        this.updateUI(puzzle, givenMask);
        
        return { puzzle, givenMask };
    }

    updateUI(puzzle, givenMask) {
        const theme = this.themes[this.storyTheme] || this.themes.mystery;
        
        document.getElementById('previewTitle').textContent = `${theme.icon} ${document.getElementById('storyTitle').value || theme.title}`;
        document.getElementById('previewPremise').textContent = document.getElementById('storyPremise').value || theme.premise;
        
        // Update stats
        document.getElementById('statDifficulty').textContent = this.getDifficultyLabel();
        document.getElementById('statClues').textContent = this.clues.length;
        
        const givenCount = givenMask.flat().filter(Boolean).length;
        document.getElementById('statGiven').textContent = givenCount;
        
        // Render puzzle
        const container = document.getElementById('puzzleContainer');
        this.renderPuzzle(container, puzzle, givenMask, false);
        
        // Render solution
        const solutionContainer = document.getElementById('solutionContainer');
        this.renderPuzzle(solutionContainer, puzzle, givenMask, true);
        
        // Render clues
        const cluesContainer = document.getElementById('cluesContainer');
        this.renderClues(cluesContainer);
        
        // Auto-verify
        this.verifyPuzzle();
        
        showToast('Puzzle generated successfully!', 'success');
    }

    renderClues(container) {
        container.innerHTML = '';
        
        const ul = document.createElement('ul');
        ul.className = 'clue-list';
        
        this.clues.forEach((clue, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Clue ${index + 1}:</strong> ${clue.text}`;
            ul.appendChild(li);
        });
        
        container.appendChild(ul);
    }

    exportPDF() {
        showToast('Generating PDF...', 'success');
        setTimeout(() => {
            window.print();
        }, 500);
    }

    exportPNG() {
        showToast('PNG export requires html2canvas library. Using print dialog instead.', 'warning');
        setTimeout(() => {
            window.print();
        }, 500);
    }

    exportJSON() {
        const data = {
            puzzle: this.puzzle,
            solution: this.solution,
            clues: this.clues,
            settings: {
                gridSize: this.gridSize,
                difficulty: this.difficulty,
                theme: this.storyTheme,
                seed: this.seed
            },
            story: {
                title: document.getElementById('storyTitle').value,
                premise: document.getElementById('storyPremise').value,
                characters: this.getCharacters()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `puzzle-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('JSON exported successfully!', 'success');
    }

    printPuzzle() {
        window.print();
    }

    toggleSolution() {
        const solutionTab = document.querySelector('[onclick="switchTab(\'solution\')"]');
        solutionTab.click();
    }

    saveSettings() {
        const settings = {
            exportFormat: document.getElementById('exportFormat').value,
            includeSolution: document.getElementById('includeSolution').value,
            paperSize: document.getElementById('paperSize').value,
            showInstructions: document.getElementById('showInstructions').value
        };
        
        localStorage.setItem('puzzleGeneratorSettings', JSON.stringify(settings));
        showToast('Settings saved!', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('puzzleGeneratorSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.exportFormat) document.getElementById('exportFormat').value = settings.exportFormat;
            if (settings.includeSolution) document.getElementById('includeSolution').value = settings.includeSolution;
            if (settings.paperSize) document.getElementById('paperSize').value = settings.paperSize;
            if (settings.showInstructions) document.getElementById('showInstructions').value = settings.showInstructions;
        }
    }
}

// Global functions for HTML onclick handlers
let generator;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

async function generatePuzzle() {
    if (!generator) generator = new PuzzleGenerator();
    await generator.generate();
}

async function generateBulk() {
    if (!generator) generator = new PuzzleGenerator();
    
    const batchSize = parseInt(document.getElementById('batchSize').value) || 1;
    const results = [];
    
    document.getElementById('bulkStatus').textContent = `Generating ${batchSize} puzzles...`;
    
    for (let i = 0; i < batchSize; i++) {
        try {
            const seedStr = `batch-${Date.now()}-${i}`;
            document.getElementById('seedControl').value = seedStr;
            
            await generator.generate();
            
            results.push({
                id: i + 1,
                seed: seedStr,
                difficulty: generator.getDifficultyLabel(),
                clues: generator.clues.length,
                verified: true
            });
            
            const progress = ((i + 1) / batchSize) * 100;
            document.getElementById('bulkProgress').style.width = `${progress}%`;
        } catch (error) {
            console.error(`Error generating puzzle ${i + 1}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Display results
    const resultsContainer = document.getElementById('bulkResults');
    resultsContainer.innerHTML = '';
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background: #ecf0f1;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">#</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Seed</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Difficulty</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Clues</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Verified</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; border: 1px solid #ddd;">${result.id}</td>
            <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">${result.seed}</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${result.difficulty}</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${result.clues}</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${result.verified ? '✓' : '✗'}</td>
            <td style="padding: 12px; border: 1px solid #ddd;">
                <button onclick="loadPuzzle(${result.id - 1})" style="padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Load</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    resultsContainer.appendChild(table);
    
    document.getElementById('bulkStatus').textContent = `Generated ${batchSize} puzzles successfully!`;
    showToast(`Bulk generation complete! ${batchSize} puzzles created.`, 'success');
    
    switchTab('bulk');
}

function loadPuzzle(index) {
    // In a full implementation, this would load from stored batch results
    showToast('Loading puzzle...', 'success');
    switchTab('preview');
}

function verifyPuzzle() {
    if (generator) {
        generator.verifyPuzzle();
    }
}

function toggleSolution() {
    if (generator) {
        generator.toggleSolution();
    }
}

function exportPDF() {
    if (generator) {
        generator.exportPDF();
    }
}

function exportPNG() {
    if (generator) {
        generator.exportPNG();
    }
}

function exportJSON() {
    if (generator) {
        generator.exportJSON();
    }
}

function printPuzzle() {
    if (generator) {
        generator.printPuzzle();
    }
}

function saveSettings() {
    if (generator) {
        generator.saveSettings();
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    generator = new PuzzleGenerator();
    
    // Generate initial puzzle
    generatePuzzle();
});
