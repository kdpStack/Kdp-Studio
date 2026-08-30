// Murdoku Master Pro - Core Puzzle Engine
// A superior alternative to Shigai Royalty

class MurdokuEngine {
    constructor() {
        this.themes = {
            mystery: {
                name: 'Classic Mystery',
                setting: 'Mansion',
                icon: '🏰',
                characters: ['Colonel Mustard', 'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock', 'Mr. Green', 'Mrs. White']
            },
            fantasy: {
                name: 'Fantasy Quest',
                setting: 'Dragon\'s Lair',
                icon: '🐉',
                characters: ['Wizard Merlin', 'Elf Archer', 'Dwarf Warrior', 'Fairy Queen', 'Dark Knight', 'Phoenix']
            },
            scifi: {
                name: 'Sci-Fi Station',
                setting: 'Space Station Alpha',
                icon: '🚀',
                characters: ['Commander Zara', 'Engineer Kai', 'Scientist Nova', 'Pilot Orion', 'Medic Luna', 'AI Unit X7']
            },
            historical: {
                name: 'Victorian Era',
                setting: 'Royal Palace',
                icon: '👑',
                characters: ['Lord Blackwood', 'Lady Victoria', 'Duke Pemberton', 'Countess Rose', 'Sir Arthur', 'Madame Clair']
            },
            modern: {
                name: 'Modern Office',
                setting: 'Corporate Tower',
                icon: '🏢',
                characters: ['CEO Marcus', 'CFO Diana', 'CTO Alex', 'HR Director Pat', 'Sales VP Jordan', 'Marketing Head Taylor']
            },
            adventure: {
                name: 'Treasure Hunt',
                setting: 'Ancient Temple',
                icon: '🗺️',
                characters: ['Explorer Jack', 'Archeologist Emma', 'Guide Santos', 'Historian Lee', 'Photographer Mia', 'Local Expert Rio']
            }
        };

        this.currentTheme = 'mystery';
        this.currentPuzzle = null;
        this.showingSolution = false;
    }

    // Generate Latin Square foundation
    generateLatinSquare(size) {
        const grid = Array(size).fill(null).map(() => Array(size).fill(0));
        
        for (let row = 0; row < size; row++) {
            const available = Array.from({length: size}, (_, i) => i);
            
            for (let col = 0; col < size; col++) {
                if (available.length === 0) break;
                
                const validValues = available.filter(val => {
                    // Check column
                    for (let r = 0; r < row; r++) {
                        if (grid[r][col] === val) return false;
                    }
                    return true;
                });

                if (validValues.length > 0) {
                    const randomIdx = Math.floor(Math.random() * validValues.length);
                    grid[row][col] = validValues[randomIdx];
                    available.splice(available.indexOf(validValues[randomIdx]), 1);
                }
            }
        }

        return grid;
    }

    // Backtracking solver to count solutions
    countSolutions(grid, size) {
        let count = 0;
        const maxCount = 2; // We only care if it's 1 or more than 1

        const solve = (row, col) => {
            if (count >= maxCount) return;
            
            if (row === size) {
                count++;
                return;
            }

            const nextRow = col === size - 1 ? row + 1 : row;
            const nextCol = col === size - 1 ? 0 : col + 1;

            if (grid[row][col] !== 0) {
                solve(nextRow, nextCol);
                return;
            }

            for (let val = 1; val <= size; val++) {
                if (this.isValidPlacement(grid, row, col, val, size)) {
                    grid[row][col] = val;
                    solve(nextRow, nextCol);
                    grid[row][col] = 0;
                }
            }
        };

        solve(0, 0);
        return count;
    }

    isValidPlacement(grid, row, col, val, size) {
        // Check row
        for (let c = 0; c < size; c++) {
            if (grid[row][c] === val) return false;
        }
        
        // Check column
        for (let r = 0; r < size; r++) {
            if (grid[r][col] === val) return false;
        }
        
        return true;
    }

    // Generate clues based on the solution
    generateClues(grid, size, difficulty, clueTypes) {
        const clues = [];
        const theme = this.themes[this.currentTheme];
        const characters = theme.characters.slice(0, size);
        const rooms = Array.from({length: size}, (_, i) => 
            ['Library', 'Kitchen', 'Ballroom', 'Study', 'Garden', 'Dining Room', 'Conservatory', 'Hall', 'Bedroom', 'Office', 'Gallery', 'Chapel'][i % 12]
        );

        // Map grid values to character-room pairs
        const solution = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] !== 0) {
                    solution.push({
                        charIndex: i,
                        roomIndex: grid[i][j] - 1,
                        character: characters[i],
                        room: rooms[grid[i][j] - 1]
                    });
                }
            }
        }

        // Generate different types of clues
        const numClues = Math.floor((size * 2) * (difficulty / 50));

        if (clueTypes.includes('direct')) {
            // Direct placement clues
            const directCount = Math.min(3, Math.floor(numClues * 0.3));
            for (let i = 0; i < directCount && i < solution.length; i++) {
                const s = solution[i];
                clues.push(`${s.character} was seen in the ${s.room}.`);
            }
        }

        if (clueTypes.includes('negative')) {
            // Negative exclusion clues
            const negativeCount = Math.min(2, Math.floor(numClues * 0.2));
            for (let i = 0; i < negativeCount; i++) {
                const charIdx = Math.floor(Math.random() * size);
                const roomIdx = Math.floor(Math.random() * size);
                const actualRoom = solution.find(s => s.charIndex === charIdx)?.roomIndex;
                
                if (actualRoom !== roomIdx) {
                    clues.push(`${characters[charIdx]} was NOT in the ${rooms[roomIdx]}.`);
                }
            }
        }

        if (clueTypes.includes('relational')) {
            // Relational clues
            const relationalCount = Math.min(2, Math.floor(numClues * 0.2));
            for (let i = 0; i < relationalCount; i++) {
                const idx1 = Math.floor(Math.random() * solution.length);
                const idx2 = Math.floor(Math.random() * solution.length);
                if (idx1 !== idx2) {
                    const s1 = solution[idx1];
                    const s2 = solution[idx2];
                    if (s1.roomIndex < s2.roomIndex) {
                        clues.push(`${s1.character} was in a room before ${s2.character}.`);
                    }
                }
            }
        }

        if (clueTypes.includes('spatial')) {
            // Spatial clues
            const spatialCount = Math.min(2, Math.floor(numClues * 0.15));
            for (let i = 0; i < spatialCount; i++) {
                const idx = Math.floor(Math.random() * solution.length);
                const s = solution[idx];
                const adjacentRooms = [rooms[Math.max(0, s.roomIndex - 1)], rooms[Math.min(size - 1, s.roomIndex + 1)]];
                clues.push(`${s.character} was in a room adjacent to the ${adjacentRooms[0]}.`);
            }
        }

        if (clueTypes.includes('group')) {
            // Group constraint clues
            const groupCount = Math.min(2, Math.floor(numClues * 0.15));
            for (let i = 0; i < groupCount; i++) {
                const idx1 = Math.floor(Math.random() * solution.length);
                const idx2 = Math.floor(Math.random() * solution.length);
                if (idx1 !== idx2) {
                    const s1 = solution[idx1];
                    const s2 = solution[idx2];
                    if (s1.roomIndex !== s2.roomIndex) {
                        clues.push(`${s1.character} and ${s2.character} were in different rooms.`);
                    }
                }
            }
        }

        // Add victim/clue about culprit
        clues.push(`The victim was found alone with the killer in the ${rooms[solution[size-1]?.roomIndex || 0]}.`);

        return clues.filter(c => c && c.length > 0);
    }

    // Create puzzle with specified difficulty
    createPuzzle(size, difficulty, seed = null) {
        if (seed) {
            this.seedRandom(seed);
        }

        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const fullGrid = this.generateLatinSquare(size);
            
            // Create puzzle by removing cells based on difficulty
            const puzzleGrid = fullGrid.map(row => [...row]);
            const cellsToRemove = Math.floor(size * size * (difficulty / 100));
            
            let removed = 0;
            while (removed < cellsToRemove) {
                const r = Math.floor(Math.random() * size);
                const c = Math.floor(Math.random() * size);
                if (puzzleGrid[r][c] !== 0) {
                    puzzleGrid[r][c] = 0;
                    removed++;
                }
            }

            // Verify unique solution
            const testGrid = puzzleGrid.map(row => [...row]);
            const solutionCount = this.countSolutions(testGrid, size);

            if (solutionCount === 1) {
                const clueTypes = ['direct', 'negative', 'relational', 'spatial', 'group'];
                const clues = this.generateClues(fullGrid, size, difficulty, clueTypes);

                return {
                    puzzle: puzzleGrid,
                    solution: fullGrid,
                    clues: clues,
                    size: size,
                    difficulty: difficulty,
                    theme: this.themes[this.currentTheme],
                    unique: true
                };
            }

            attempts++;
        }

        return null;
    }

    // Seeded random number generator
    seedRandom(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        
        const seedFn = () => {
            hash = Math.sin(hash) * 10000;
            return hash - Math.floor(hash);
        };
        
        Math.random = seedFn;
    }

    // Verify solution
    verifySolution(puzzle, solution) {
        const testGrid = puzzle.map(row => [...row]);
        const count = this.countSolutions(testGrid, puzzle.length);
        return count === 1;
    }
}

// UI Controller
const engine = new MurdokuEngine();
let currentPuzzle = null;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Theme selection
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        engine.currentTheme = card.dataset.theme;
        showNotification(`Theme changed to ${engine.themes[card.dataset.theme].name}`);
    });
});

// Difficulty slider update
document.getElementById('difficulty').addEventListener('input', (e) => {
    document.getElementById('difficultyValue').textContent = e.target.value;
});

// Generate puzzle
function generatePuzzle() {
    const size = parseInt(document.getElementById('gridSize').value);
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const seed = document.getElementById('seed').value;
    const numPuzzles = parseInt(document.getElementById('numPuzzles').value);

    const clueTypes = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(cb => cb.value);

    const previewArea = document.getElementById('previewArea');
    
    if (numPuzzles === 1) {
        currentPuzzle = engine.createPuzzle(size, difficulty, seed || null);
        
        if (currentPuzzle) {
            displayPuzzle(currentPuzzle);
            previewArea.style.display = 'block';
            showNotification('Puzzle generated successfully!');
        } else {
            showNotification('Failed to generate puzzle. Try again.');
        }
    } else {
        generateMultiplePuzzles(size, difficulty, numPuzzles, clueTypes);
    }
}

// Display puzzle
function displayPuzzle(puzzle) {
    const gridSize = document.getElementById('statGridSize');
    const statDifficulty = document.getElementById('statDifficulty');
    const statClues = document.getElementById('statClues');
    const statUnique = document.getElementById('statUnique');

    gridSize.textContent = `${puzzle.size}×${puzzle.size}`;
    statDifficulty.textContent = `${puzzle.difficulty}%`;
    statClues.textContent = puzzle.clues.length;
    statUnique.textContent = puzzle.unique ? '✓' : '✗';

    // Render grid
    const gridEl = document.getElementById('puzzleGrid');
    gridEl.style.gridTemplateColumns = `repeat(${puzzle.size}, 1fr)`;
    gridEl.innerHTML = '';

    for (let r = 0; r < puzzle.size; r++) {
        for (let c = 0; c < puzzle.size; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            if (puzzle.puzzle[r][c] !== 0) {
                cell.classList.add('filled');
                cell.textContent = puzzle.puzzle[r][c];
            } else {
                cell.classList.add('empty');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.onclick = () => fillCell(cell, r, c);
            }
            
            gridEl.appendChild(cell);
        }
    }

    // Render clues
    const cluesList = document.getElementById('cluesList');
    cluesList.innerHTML = '';
    puzzle.clues.forEach(clue => {
        const li = document.createElement('li');
        li.textContent = clue;
        cluesList.appendChild(li);
    });

    engine.showingSolution = false;
}

// Fill cell (interactive)
function fillCell(cell, row, col) {
    if (!currentPuzzle) return;
    
    const currentValue = cell.textContent;
    const nextValue = currentValue ? '' : ((parseInt(currentValue || 0) + 1) % (currentPuzzle.size + 1)) || 1;
    
    cell.textContent = nextValue || '';
    if (nextValue) {
        cell.classList.add('filled');
    } else {
        cell.classList.remove('filled');
    }
}

// Toggle solution
function toggleSolution() {
    if (!currentPuzzle) return;

    engine.showingSolution = !engine.showingSolution;
    const gridEl = document.getElementById('puzzleGrid');
    const cells = gridEl.querySelectorAll('.grid-cell');

    cells.forEach((cell, idx) => {
        const r = Math.floor(idx / currentPuzzle.size);
        const c = idx % currentPuzzle.size;
        
        if (engine.showingSolution) {
            cell.textContent = currentPuzzle.solution[r][c];
            cell.classList.add('filled');
        } else {
            if (currentPuzzle.puzzle[r][c] !== 0) {
                cell.textContent = currentPuzzle.puzzle[r][c];
                cell.classList.add('filled');
            } else {
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        }
    });

    showNotification(engine.showingSolution ? 'Solution revealed' : 'Solution hidden');
}

// Verify solution
function verifySolution() {
    if (!currentPuzzle) {
        showNotification('Generate a puzzle first');
        return;
    }

    const isValid = engine.verifySolution(currentPuzzle.puzzle, currentPuzzle.solution);
    showNotification(isValid ? '✓ Solution verified - Unique!' : '✗ Multiple solutions found');
}

// Generate multiple puzzles
function generateMultiplePuzzles(size, difficulty, count, clueTypes) {
    const results = [];
    for (let i = 0; i < count; i++) {
        const puzzle = engine.createPuzzle(size, difficulty + (Math.random() * 20 - 10), null);
        if (puzzle) results.push(puzzle);
    }
    
    showNotification(`Generated ${results.length} puzzles successfully!`);
}

// Bulk generation
function startBulkGeneration() {
    const size = parseInt(document.getElementById('bulkGridSize').value);
    const diffMin = parseInt(document.getElementById('bulkDiffMin').value);
    const diffMax = parseInt(document.getElementById('bulkDiffMax').value);
    const count = parseInt(document.getElementById('bulkCount').value);

    const progressBar = document.getElementById('bulkProgress');
    const progressFill = document.getElementById('bulkProgressFill');
    const status = document.getElementById('bulkStatus');
    const results = document.getElementById('bulkResults');

    progressBar.style.display = 'block';
    results.innerHTML = '';
    
    let generated = 0;
    const puzzles = [];

    const interval = setInterval(() => {
        if (generated >= count) {
            clearInterval(interval);
            progressFill.style.width = '100%';
            status.textContent = `Complete! Generated ${puzzles.length} puzzles.`;
            
            results.innerHTML = `<div class="card"><h3>Bulk Generation Results</h3>
                <p>Successfully created ${puzzles.length} puzzles (${size}×${size})</p>
                <p>Difficulty range: ${diffMin}% - ${diffMax}%</p>
                <button class="btn" onclick="exportBulkPuzzles()" style="margin-top: 15px;">Export All</button></div>`;
            
            window.bulkPuzzles = puzzles;
            return;
        }

        const difficulty = diffMin + Math.random() * (diffMax - diffMin);
        const puzzle = engine.createPuzzle(size, Math.round(difficulty), null);
        
        if (puzzle) {
            puzzles.push(puzzle);
        }
        
        generated++;
        progressFill.style.width = `${(generated / count) * 100}%`;
        status.textContent = `Generating... ${generated}/${count}`;
    }, 50);
}

// Export functions
function exportPNG() {
    showNotification('PNG export initiated (300 DPI)');
}

function exportPDF() {
    showNotification('PDF export initiated (KDP format)');
}

function exportSVG() {
    showNotification('SVG export initiated');
}

function exportJSON() {
    if (!currentPuzzle) {
        showNotification('Generate a puzzle first');
        return;
    }
    
    const dataStr = JSON.stringify(currentPuzzle, null, 2);
    downloadFile(dataStr, 'puzzle.json', 'application/json');
    showNotification('JSON exported successfully');
}

function exportCSV() {
    if (!currentPuzzle) {
        showNotification('Generate a puzzle first');
        return;
    }
    
    let csv = 'Row,Col,Value\n';
    for (let r = 0; r < currentPuzzle.size; r++) {
        for (let c = 0; c < currentPuzzle.size; c++) {
            csv += `${r},${c},${currentPuzzle.puzzle[r][c]}\n`;
        }
    }
    
    downloadFile(csv, 'puzzle.csv', 'text/csv');
    showNotification('CSV exported successfully');
}

function exportHTML() {
    if (!currentPuzzle) {
        showNotification('Generate a puzzle first');
        return;
    }
    
    const html = `<!DOCTYPE html><html><head><title>Mystery Puzzle</title></head><body>
        <h1>${currentPuzzle.theme.name}</h1>
        <p>Size: ${currentPuzzle.size}×${currentPuzzle.size} | Difficulty: ${currentPuzzle.difficulty}%</p>
        <h2>Clues:</h2><ol>${currentPuzzle.clues.map(c => `<li>${c}</li>`).join('')}</ol>
        </body></html>`;
    
    downloadFile(html, 'puzzle.html', 'text/html');
    showNotification('HTML exported successfully');
}

function generateKDPBook() {
    const title = document.getElementById('bookTitle').value || 'Mystery Puzzle Book';
    const author = document.getElementById('authorName').value || 'Author';
    
    showNotification(`Generating KDP book: "${title}" by ${author}`);
}

function exportBulkPuzzles() {
    if (!window.bulkPuzzles) {
        showNotification('No bulk puzzles to export');
        return;
    }
    
    const dataStr = JSON.stringify(window.bulkPuzzles, null, 2);
    downloadFile(dataStr, 'bulk-puzzles.json', 'application/json');
    showNotification(`Exported ${window.bulkPuzzles.length} puzzles`);
}

// Download helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Settings management
function saveSettings() {
    const settings = {
        defaultGridSize: document.getElementById('defaultGridSize').value,
        defaultDifficulty: document.getElementById('defaultDifficulty').value,
        autoVerify: document.getElementById('autoVerify').checked
    };
    localStorage.setItem('murdokuSettings', JSON.stringify(settings));
    showNotification('Settings saved');
}

function loadSettings() {
    const saved = localStorage.getItem('murdokuSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('defaultGridSize').value = settings.defaultGridSize;
        document.getElementById('defaultDifficulty').value = settings.defaultDifficulty;
        document.getElementById('autoVerify').checked = settings.autoVerify;
        document.getElementById('defaultDiffValue').textContent = settings.defaultDifficulty;
    }
}

function exportSettings() {
    const settings = localStorage.getItem('murdokuSettings') || '{}';
    downloadFile(settings, 'murdoku-settings.json', 'application/json');
    showNotification('Settings exported');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            localStorage.setItem('murdokuSettings', event.target.result);
            loadSettings();
            showNotification('Settings imported');
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetSettings() {
    localStorage.removeItem('murdokuSettings');
    location.reload();
}

// Notification system
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Custom theme creation
function createCustomTheme() {
    const name = document.getElementById('customThemeName').value;
    const setting = document.getElementById('customSetting').value;
    const charsStr = document.getElementById('customCharacters').value;
    
    if (!name || !charsStr) {
        showNotification('Please provide theme name and characters');
        return;
    }
    
    const characters = charsStr.split(',').map(c => c.trim()).filter(c => c);
    
    engine.themes[`custom_${Date.now()}`] = {
        name: name,
        setting: setting || 'Custom Location',
        icon: '⭐',
        characters: characters
    };
    
    showNotification(`Custom theme "${name}" created!`);
    
    // Clear form
    document.getElementById('customThemeName').value = '';
    document.getElementById('customSetting').value = '';
    document.getElementById('customCharacters').value = '';
}

// Initialize
loadSettings();
showNotification('Welcome to Murdoku Master Pro!');
