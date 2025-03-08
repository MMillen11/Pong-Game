// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('pong');
    const context = canvas.getContext('2d');
    
    // Load images
    const flagImage = new Image();
    flagImage.src = './images/cartoon-2026568_640.png';
    let imageLoaded = false;
    
    const americanFlagImage = new Image();
    americanFlagImage.src = './images/american-flag-2144392_640.png';
    let americanFlagLoaded = false;
    
    const canadianFlagImage = new Image();
    canadianFlagImage.src = './images/canada-27003_640.png';
    let canadianFlagLoaded = false;
    
    // Image load handlers
    flagImage.onload = () => {
        imageLoaded = true;
        checkAllImagesLoaded();
    };
    
    americanFlagImage.onload = () => {
        americanFlagLoaded = true;
        checkAllImagesLoaded();
    };
    
    canadianFlagImage.onload = () => {
        canadianFlagLoaded = true;
        checkAllImagesLoaded();
    };
    
    function checkAllImagesLoaded() {
        if (imageLoaded && americanFlagLoaded && canadianFlagLoaded) {
            draw(); // Initial draw once all images are loaded
        }
    }
    
    // Game elements
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const playerScoreElement = document.getElementById('player-score');
    const computerScoreElement = document.getElementById('computer-score');
    
    // Game state
    let gameRunning = false;
    let animationId;
    let playerScore = 0;
    let computerScore = 0;
    let winningScore = 10;
    
    // Explosion effects array
    let explosions = [];
    
    // Clint Eastwood quotes
    const clintEastwoodQuotes = [
        "Go ahead, make my day.",
        "You've got to ask yourself one question: 'Do I feel lucky?' Well, do ya, punk?",
        "A man's got to know his limitations.",
        "I have a very strict gun control policy: if there's a gun around, I want to be in control of it.",
        "Everybody's got a right to be a sucker... once.",
        "If you want a guarantee, buy a toaster.",
        "Sometimes if you want to see a change for the better, you have to take things into your own hands.",
        "I'm not doing it to win an award. I'm doing it because I enjoy it.",
        "There's a rebel lying deep in my soul.",
        "I don't believe in pessimism. If something doesn't come up the way you want, forge ahead.",
        "I tried being reasonable, I didn't like it.",
        "You see, in this world, there's two kinds of people, my friend: those with loaded guns and those who dig. You dig.",
        "Ever notice how you come across somebody once in a while you shouldn't have messed with? That's me.",
        "I have strong feelings about gun control. If there's a gun around, I want to be controlling it.",
        "Improvise, adapt and overcome."
    ];
    
    // Quote popup variables
    let quotePopup = {
        active: false,
        text: "",
        duration: 2000,  // Changed to 2 seconds
        timer: null,
        alpha: 1,
        fadeSpeed: 0.0002
    };
    
    // Game settings based on difficulty
    const difficulties = {
        easy: {
            computerSpeed: 3,
            ballSpeed: 5,
            ballSpeedIncrement: 0.2
        },
        medium: {
            computerSpeed: 5,
            ballSpeed: 7,
            ballSpeedIncrement: 0.3
        },
        hard: {
            computerSpeed: 7,
            ballSpeed: 9,
            ballSpeedIncrement: 0.4
        }
    };
    
    // Get current difficulty settings
    let currentDifficulty = difficulties[difficultySelect.value];
    
    // Game objects
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speed: currentDifficulty.ballSpeed,
        velocityX: 5,
        velocityY: 5,
        color: '#FFFFFF',
        rotation: 0,
        rotationSpeed: 0.05
    };
    
    const player = {
        x: 30,
        y: canvas.height / 2 - 50,
        width: 30,  // Adjusted for flag aspect ratio
        height: 60,  // Adjusted for flag aspect ratio
        handleLength: 20,
        handleWidth: 6,
        color: '#2196F3',  // Kept for fallback
        score: 0
    };
    
    const computer = {
        x: canvas.width - 60,  // Adjusted position for new width
        y: canvas.height / 2 - 50,
        width: 30,  // Adjusted for flag aspect ratio
        height: 60,  // Adjusted for flag aspect ratio
        handleLength: 20,
        handleWidth: 6,
        color: '#F44336',  // Kept for fallback
        score: 0
    };
    
    const net = {
        x: canvas.width / 2 - 1,
        y: 0,
        width: 2,
        height: 10,
        color: '#FFFFFF'
    };
    
    // Table colors
    const tableColors = {
        surface: '#0C5F1B',  // Dark green like a ping pong table
        border: '#FFFFFF',   // White border
        lines: '#FFFFFF'     // White lines
    };
    
    // Obstacles array
    const obstacles = [
        {
            x: canvas.width / 2 - 80,
            y: canvas.height / 4,
            width: 160,  // Wider to maintain image aspect ratio
            height: 40,  // Taller to maintain image aspect ratio
            active: true
        },
        {
            x: canvas.width / 2 - 80,
            y: canvas.height / 2 - 20,
            width: 160,
            height: 40,
            active: true
        },
        {
            x: canvas.width / 2 - 80,
            y: (canvas.height * 3) / 4 - 20,
            width: 160,
            height: 40,
            active: true
        }
    ];
    
    // Event Listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    difficultySelect.addEventListener('change', changeDifficulty);
    
    // Mouse movement for player paddle
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.height / rect.height;
        player.y = (event.clientY - rect.top) * scale - player.height / 2;
        
        // Keep paddle within canvas bounds
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
        }
    });
    
    // Touch movement for mobile
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.height / rect.height;
        const touch = event.touches[0];
        player.y = (touch.clientY - rect.top) * scale - player.height / 2;
        
        // Keep paddle within canvas bounds
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
        }
    }, { passive: false });
    
    // Functions
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            startButton.textContent = 'Pause Game';
            resetBall();
            gameLoop();
        } else {
            gameRunning = false;
            startButton.textContent = 'Resume Game';
            cancelAnimationFrame(animationId);
        }
    }
    
    function resetGame() {
        gameRunning = false;
        startButton.textContent = 'Start Game';
        cancelAnimationFrame(animationId);
        
        // Reset scores
        playerScore = 0;
        computerScore = 0;
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
        
        // Reset ball and paddles
        resetBall();
        player.y = canvas.height / 2 - player.height / 2;
        computer.y = canvas.height / 2 - computer.height / 2;
        
        // Reset obstacles
        obstacles.forEach(obstacle => obstacle.active = true);
        
        // Draw the initial state
        draw();
    }
    
    function changeDifficulty() {
        currentDifficulty = difficulties[difficultySelect.value];
        ball.speed = currentDifficulty.ballSpeed;
        
        // If game is paused, update the display
        if (!gameRunning) {
            draw();
        }
    }
    
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = currentDifficulty.ballSpeed;
        
        // Random direction
        ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
        ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5);
    }
    
    function drawRect(x, y, width, height, color) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }
    
    function drawCircle(x, y, radius, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
    }
    
    function drawPingPongBall(ball) {
        // Draw the main white ball
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
        
        // Add a subtle shadow for 3D effect
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
        context.strokeStyle = '#CCCCCC';
        context.lineWidth = 1;
        context.stroke();
        
        // Draw the characteristic seam of a ping pong ball
        context.save();
        context.translate(ball.x, ball.y);
        context.rotate(ball.rotation);
        
        // Draw the curved seam
        context.beginPath();
        context.arc(0, 0, ball.radius * 0.7, 0, Math.PI, true);
        context.strokeStyle = '#DDDDDD';
        context.lineWidth = 1.5;
        context.stroke();
        
        context.restore();
        
        // Update rotation for animation
        ball.rotation += ball.rotationSpeed * (Math.abs(ball.velocityX) + Math.abs(ball.velocityY)) / 10;
    }
    
    function drawTable() {
        // Draw the main table surface
        drawRect(0, 0, canvas.width, canvas.height, tableColors.surface);
        
        // Draw border
        context.strokeStyle = tableColors.border;
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Draw center line
        context.beginPath();
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.strokeStyle = tableColors.lines;
        context.lineWidth = 2;
        context.setLineDash([5, 5]);  // Dashed line
        context.stroke();
        context.setLineDash([]);  // Reset to solid line
        
        // Draw center circle
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2, false);
        context.strokeStyle = tableColors.lines;
        context.lineWidth = 2;
        context.stroke();
    }
    
    function drawNet() {
        // Draw the net
        context.beginPath();
        context.setLineDash([5, 3]);
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.stroke();
        context.setLineDash([]);
    }
    
    function drawText(text, x, y, color, size = '30px') {
        context.fillStyle = color;
        context.font = `${size} Arial`;
        context.textAlign = 'center';
        context.fillText(text, x, y);
    }
    
    function drawPaddle(paddle) {
        context.save();
        
        // Add shadow for depth
        context.shadowColor = 'rgba(0, 0, 0, 0.2)';
        context.shadowBlur = 5;
        context.shadowOffsetY = 2;
        
        // Determine which flag to use based on if it's the player or computer paddle
        const flagImage = paddle === player ? americanFlagImage : canadianFlagImage;
        
        // Draw the paddle using the flag image
        if ((paddle === player && americanFlagLoaded) || (paddle === computer && canadianFlagLoaded)) {
            // Draw the main paddle part
            context.drawImage(
                flagImage,
                paddle.x,
                paddle.y,
                paddle.width,
                paddle.height
            );
            
            // Draw the handle
            const handleX = paddle === player ? 
                paddle.x + paddle.width : 
                paddle.x - paddle.handleWidth;
            
            const handleY = paddle.y + (paddle.height / 2) - (paddle.handleLength / 2);
            
            context.fillStyle = '#8B4513';  // Brown color for wooden handle
            context.fillRect(
                handleX,
                handleY,
                paddle.handleWidth,
                paddle.handleLength
            );
        }
        
        // Add a subtle border around the paddle
        context.strokeStyle = '#333333';
        context.lineWidth = 2;
        context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        context.restore();
    }
    
    function drawExplosion(explosion) {
        if (explosion.isFlash) {
            // Draw flash as a gradient
            const gradient = context.createRadialGradient(
                explosion.x, explosion.y, 0,
                explosion.x, explosion.y, explosion.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, ' + explosion.alpha + ')');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.beginPath();
            context.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2, false);
            context.fillStyle = gradient;
            context.fill();
        } else {
            // Draw regular particle
            context.beginPath();
            context.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2, false);
            context.fillStyle = explosion.color;
            context.globalAlpha = explosion.alpha;
            context.fill();
            context.globalAlpha = 1;
        }
    }
    
    function createExplosion(x, y, isPlayer) {
        // Create multiple particles for the explosion
        const particleCount = 20; // Increased particle count
        const colors = isPlayer ? 
            ['#3498DB', '#2980B9', '#1ABC9C', '#FFFFFF', '#85C1E9', '#5DADE2'] : 
            ['#E74C3C', '#C0392B', '#F39C12', '#FFFFFF', '#F5B041', '#EC7063'];
        
        // Play explosion sound
        playSound('explosion');
        
        // Create a flash effect
        explosions.push({
            x: x,
            y: y,
            radius: 30,
            color: '#FFFFFF',
            velocityX: 0,
            velocityY: 0,
            alpha: 0.8,
            decay: 0.2,
            isFlash: true
        });
        
        // Create particles in a circular pattern
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2; // Increased speed range
            const radius = Math.random() * 6 + 2; // Increased size range
            
            explosions.push({
                x: x,
                y: y,
                radius: radius,
                color: colors[Math.floor(Math.random() * colors.length)],
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.01,
                isFlash: false
            });
        }
        
        // Create a few larger, slower particles
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            const radius = Math.random() * 8 + 6;
            
            explosions.push({
                x: x,
                y: y,
                radius: radius,
                color: colors[Math.floor(Math.random() * colors.length)],
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                alpha: 0.9,
                decay: Math.random() * 0.01 + 0.005,
                isFlash: false
            });
        }
    }
    
    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            
            // Update position
            explosion.x += explosion.velocityX;
            explosion.y += explosion.velocityY;
            
            // Update alpha
            explosion.alpha -= explosion.decay;
            
            // Remove faded explosions
            if (explosion.alpha <= 0) {
                explosions.splice(i, 1);
            }
        }
    }
    
    function showQuote(isPlayer) {
        // Clear any existing quote timer
        if (quotePopup.timer) {
            clearTimeout(quotePopup.timer);
        }
        
        // Select a random Clint Eastwood quote
        const randomIndex = Math.floor(Math.random() * clintEastwoodQuotes.length);
        quotePopup.text = clintEastwoodQuotes[randomIndex];
        quotePopup.active = true;
        quotePopup.alpha = 1;
        
        // Set a timer to hide the quote after the duration
        quotePopup.timer = setTimeout(() => {
            quotePopup.active = false;
        }, quotePopup.duration);
    }
    
    function drawQuotePopup() {
        if (!quotePopup.active) return;
        
        // Create semi-transparent background
        context.fillStyle = `rgba(0, 0, 0, ${quotePopup.alpha * 0.7})`;
        const popupWidth = canvas.width * 0.8;
        const popupHeight = 100;
        const popupX = (canvas.width - popupWidth) / 2;
        const popupY = canvas.height / 2 - 120;
        
        // Draw rounded rectangle for popup
        context.beginPath();
        context.moveTo(popupX + 20, popupY);
        context.lineTo(popupX + popupWidth - 20, popupY);
        context.quadraticCurveTo(popupX + popupWidth, popupY, popupX + popupWidth, popupY + 20);
        context.lineTo(popupX + popupWidth, popupY + popupHeight - 20);
        context.quadraticCurveTo(popupX + popupWidth, popupY + popupHeight, popupX + popupWidth - 20, popupY + popupHeight);
        context.lineTo(popupX + 20, popupY + popupHeight);
        context.quadraticCurveTo(popupX, popupY + popupHeight, popupX, popupY + popupHeight - 20);
        context.lineTo(popupX, popupY + 20);
        context.quadraticCurveTo(popupX, popupY, popupX + 20, popupY);
        context.closePath();
        context.fill();
        
        // Draw border
        context.strokeStyle = `rgba(255, 255, 255, ${quotePopup.alpha * 0.8})`;
        context.lineWidth = 2;
        context.stroke();
        
        // Draw text
        context.fillStyle = `rgba(255, 255, 255, ${quotePopup.alpha})`;
        context.font = '18px "Courier New", monospace';
        context.textAlign = 'center';
        context.fillText(`"${quotePopup.text}"`, canvas.width / 2, popupY + 45);
        
        // Draw attribution
        context.font = '14px "Courier New", monospace';
        context.fillStyle = `rgba(200, 200, 200, ${quotePopup.alpha})`;
        context.fillText("- Clint Eastwood", canvas.width / 2, popupY + 75);
        
        // Fade out effect
        quotePopup.alpha -= quotePopup.fadeSpeed;
        if (quotePopup.alpha <= 0) {
            quotePopup.active = false;
        }
    }
    
    function checkObstacleCollision() {
        for (let obstacle of obstacles) {
            if (!obstacle.active) continue;

            // Check if ball collides with obstacle
            if (ball.x + ball.radius > obstacle.x &&
                ball.x - ball.radius < obstacle.x + obstacle.width &&
                ball.y + ball.radius > obstacle.y &&
                ball.y - ball.radius < obstacle.y + obstacle.height) {
                
                // Create explosion effect
                createExplosion(ball.x, ball.y);
                
                // Determine which side of the obstacle was hit
                const ballCenterX = ball.x;
                const ballCenterY = ball.y;
                const obstacleCenterX = obstacle.x + obstacle.width / 2;
                const obstacleCenterY = obstacle.y + obstacle.height / 2;
                
                // Calculate collision angle
                const angle = Math.atan2(ballCenterY - obstacleCenterY, ballCenterX - obstacleCenterX);
                
                // Determine if collision is more horizontal or vertical
                if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
                    // Horizontal collision
                    ball.velocityX *= -1;
                } else {
                    // Vertical collision
                    ball.velocityY *= -1;
                }
                
                // Increase ball speed slightly
                ball.velocityX *= 1.1;
                ball.velocityY *= 1.1;
                
                // Play bounce sound (if we add sound later)
                // playBounceSound();
                
                // Add some randomness to the bounce
                ball.velocityY += (Math.random() - 0.5) * 2;
                
                // Prevent ball from getting stuck in obstacle
                while (ball.x + ball.radius > obstacle.x &&
                       ball.x - ball.radius < obstacle.x + obstacle.width &&
                       ball.y + ball.radius > obstacle.y &&
                       ball.y - ball.radius < obstacle.y + obstacle.height) {
                    ball.x += Math.sign(ball.velocityX);
                    ball.y += Math.sign(ball.velocityY);
                }
            }
        }
    }

    function drawObstacles() {
        if (!imageLoaded) return;  // Don't draw if image isn't loaded yet

        for (let obstacle of obstacles) {
            if (!obstacle.active) continue;
            
            // Draw the image instead of rectangles
            context.save();
            
            // Add shadow for depth
            context.shadowColor = 'rgba(0, 0, 0, 0.2)';
            context.shadowBlur = 5;
            context.shadowOffsetY = 2;
            
            // Draw the image stretched to fit the obstacle dimensions
            context.drawImage(
                flagImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );
            
            // Add a subtle border
            context.strokeStyle = '#333333';
            context.lineWidth = 2;
            context.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            context.restore();
        }
    }
    
    function draw() {
        // Draw the table
        drawTable();
        
        // Draw net
        drawNet();
        
        // Draw paddles
        drawPaddle(player);
        drawPaddle(computer);
        
        // Draw ball
        drawPingPongBall(ball);
        
        // Draw explosions
        explosions.forEach(explosion => {
            drawExplosion(explosion);
        });
        
        // Draw quote popup
        drawQuotePopup();
        
        // Draw obstacles
        drawObstacles();
        
        // Draw game over message if needed
        if (playerScore >= winningScore || computerScore >= winningScore) {
            // Add semi-transparent overlay
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            const winner = playerScore >= winningScore ? 'You Win!' : 'Computer Wins!';
            drawText(winner, canvas.width / 2, canvas.height / 2 - 30, '#FFFFFF', '40px');
            drawText('Game Over', canvas.width / 2, canvas.height / 2 + 30, '#FFFFFF', '30px');
        }
    }
    
    function collision(ball, paddle) {
        // Check if ball collides with paddle
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;
        
        // Adjust paddle left and right based on which paddle it is
        let paddleLeft, paddleRight;
        
        if (paddle === player) {
            paddleLeft = paddle.x;
            paddleRight = paddle.x + paddle.width + paddle.handleWidth;
        } else {
            paddleLeft = paddle.x - paddle.handleWidth;
            paddleRight = paddle.x + paddle.width;
        }
        
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        
        // Check if the ball is within the paddle's bounding box
        if (ballRight > paddleLeft && ballLeft < paddleRight && ballBottom > paddleTop && ballTop < paddleBottom) {
            // For the handle part, we need a more precise check
            if (paddle === player && ballLeft < paddle.x + paddle.width) {
                return true;
            } else if (paddle === computer && ballRight > paddle.x) {
                return true;
            }
            
            // Check if the ball is hitting the handle
            const handleY = paddle.y + (paddle.height / 2) - (paddle.handleLength / 2);
            const handleBottom = handleY + paddle.handleLength;
            
            if (ballBottom > handleY && ballTop < handleBottom) {
                return true;
            }
        }
        
        return false;
    }
    
    function updateComputerPaddle() {
        // Simple AI for computer paddle
        const computerCenter = computer.y + computer.height / 2;
        const ballCenter = ball.y;
        
        // Only move if the ball is moving toward the computer
        if (ball.velocityX > 0) {
            if (computerCenter < ballCenter) {
                computer.y += currentDifficulty.computerSpeed;
            } else {
                computer.y -= currentDifficulty.computerSpeed;
            }
        }
        
        // Keep computer paddle within canvas bounds
        if (computer.y < 0) {
            computer.y = 0;
        }
        if (computer.y > canvas.height - computer.height) {
            computer.y = canvas.height - computer.height;
        }
    }
    
    function update() {
        // Update ball position
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // Update computer paddle
        updateComputerPaddle();
        
        // Update explosions
        updateExplosions();
        
        // Check for obstacle collisions
        checkObstacleCollision();
        
        // Ball collision with top and bottom walls
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
            
            // Play wall hit sound
            playSound('wall');
        }
        
        // Determine which paddle is being hit (player or computer)
        let paddle = ball.x < canvas.width / 2 ? player : computer;
        
        // Ball collision with paddles
        if (collision(ball, paddle)) {
            // Play paddle hit sound
            playSound('paddle');
            
            // Create explosion effect
            createExplosion(ball.x, ball.y, paddle === player);
            
            // Calculate where the ball hit the paddle
            const collidePoint = ball.y - (paddle.y + paddle.height / 2);
            const collidePointNormalized = collidePoint / (paddle.height / 2);
            
            // Calculate angle
            const angle = collidePointNormalized * Math.PI / 4;
            
            // Determine direction based on which paddle was hit
            const direction = ball.x < canvas.width / 2 ? 1 : -1;
            
            // Change velocity based on where the ball hit the paddle
            ball.velocityX = direction * ball.speed * Math.cos(angle);
            ball.velocityY = ball.speed * Math.sin(angle);
            
            // Increase ball speed with each hit
            ball.speed += currentDifficulty.ballSpeedIncrement;
        }
        
        // Ball goes out of bounds - scoring
        if (ball.x - ball.radius < 0) {
            // Computer scores
            computerScore++;
            computerScoreElement.textContent = computerScore;
            playSound('score');
            
            // Show Clint Eastwood quote when player gets scored on
            showQuote(true);
            
            resetBall();
            
            // Check for game over
            if (computerScore >= winningScore) {
                gameRunning = false;
                startButton.textContent = 'Start New Game';
            }
        } else if (ball.x + ball.radius > canvas.width) {
            // Player scores
            playerScore++;
            playerScoreElement.textContent = playerScore;
            playSound('score');
            
            // Show Clint Eastwood quote when computer gets scored on
            showQuote(false);
            
            resetBall();
            
            // Check for game over
            if (playerScore >= winningScore) {
                gameRunning = false;
                startButton.textContent = 'Start New Game';
            }
        }
    }
    
    function playSound(type) {
        // Simple sound effects using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'paddle':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'wall':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'score':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'explosion':
                // Create a more complex explosion sound
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.stop(audioContext.currentTime + 0.2);
                
                // Add a second oscillator for a more complex sound
                setTimeout(() => {
                    const audioContext2 = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator2 = audioContext2.createOscillator();
                    const gainNode2 = audioContext2.createGain();
                    
                    oscillator2.connect(gainNode2);
                    gainNode2.connect(audioContext2.destination);
                    
                    oscillator2.type = 'square';
                    oscillator2.frequency.setValueAtTime(300, audioContext2.currentTime);
                    gainNode2.gain.setValueAtTime(0.1, audioContext.currentTime);
                    oscillator2.start();
                    oscillator2.frequency.exponentialRampToValueAtTime(50, audioContext2.currentTime + 0.1);
                    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext2.currentTime + 0.1);
                    oscillator2.stop(audioContext2.currentTime + 0.1);
                }, 50);
                break;
        }
    }
    
    function gameLoop() {
        if (gameRunning) {
            // Update game state
            update();
            
            // Draw game objects
            draw();
            
            // Continue game loop
            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    // Initialize the game display
    draw();
}); 