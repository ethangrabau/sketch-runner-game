class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.character = new Character(this.canvas);
        this.obstacles = [];
        this.discoveryPoints = [];
        this.score = 0;
        this.gameOver = false;

        // Game state
        this.lastObstacleTime = 0;
        this.lastDiscoveryTime = 0;
        this.minObstacleInterval = 1500;
        this.minDiscoveryInterval = 5000;

        // Event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.character.jump();
            }
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.character.jump();
        });

        // Start the game loop
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        if (this.gameOver) return;

        // Update character
        this.character.update();

        // Generate obstacles
        const currentTime = Date.now();
        if (currentTime - this.lastObstacleTime > this.minObstacleInterval) {
            this.obstacles.push(new Obstacle(this.canvas));
            this.lastObstacleTime = currentTime;
        }

        // Generate discovery points
        if (currentTime - this.lastDiscoveryTime > this.minDiscoveryInterval) {
            this.discoveryPoints.push(new DiscoveryPoint(this.canvas));
            this.lastDiscoveryTime = currentTime;
        }

        // Update and clean up obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (obstacle.isColliding(this.character)) {
                this.gameOver = true;
            }
            return obstacle.x + obstacle.width > 0;
        });

        // Update and clean up discovery points
        this.discoveryPoints = this.discoveryPoints.filter(point => {
            point.update();
            if (!point.isCollected && point.isColliding(this.character)) {
                point.isCollected = true;
                this.score += 100;
                // TODO: Show discovery content
            }
            return point.x + point.radius > 0;
        });

        // Update score
        this.score += 0.1;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        utils.sketchLine(
            this.ctx,
            0,
            this.canvas.height - 50,
            this.canvas.width,
            this.canvas.height - 50
        );

        // Draw game elements
        this.obstacles.forEach(obstacle => obstacle.draw());
        this.discoveryPoints.forEach(point => point.draw());
        this.character.draw();

        // Draw score
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 20, 30);

        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                `Final Score: ${Math.floor(this.score)}`,
                this.canvas.width/2,
                this.canvas.height/2 + 40
            );
            this.ctx.fillText(
                'Tap or press Space to restart',
                this.canvas.width/2,
                this.canvas.height/2 + 80
            );
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        this.character = new Character(this.canvas);
        this.obstacles = [];
        this.discoveryPoints = [];
        this.score = 0;
        this.gameOver = false;
        this.lastObstacleTime = 0;
        this.lastDiscoveryTime = 0;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});