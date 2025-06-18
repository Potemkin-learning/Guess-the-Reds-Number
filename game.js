// ゲーム状態管理
class GuessTheNumberGame {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 5;
        this.score = 0;
        this.currentPlayer = null;
        this.usedPlayers = [];
        this.isAnswered = false;
        
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
    }
    
    initializeElements() {
        // HTML要素の参照を取得
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.playerImage = document.getElementById('player-image');
        this.playerName = document.getElementById('player-name');
        this.choiceBtns = document.querySelectorAll('.choice-btn');
        this.feedback = document.getElementById('feedback');
        this.feedbackText = document.getElementById('feedback-text');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.currentQuestionEl = document.getElementById('current-question');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.scoreEl = document.getElementById('score');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalTotalEl = document.getElementById('final-total');
        this.accuracyEl = document.getElementById('accuracy');
    }
    
    bindEvents() {
        // イベントリスナーの設定
        this.choiceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        });
        
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.startNewGame());
    }
    
    startNewGame() {
        // ゲームの初期化
        this.currentQuestion = 0;
        this.score = 0;
        this.usedPlayers = [];
        this.isAnswered = false;
        
        // UI更新
        this.updateScoreDisplay();
        this.showGameScreen();
        this.loadNextQuestion();
    }
    
    loadNextQuestion() {
        this.currentQuestion++;
        this.isAnswered = false;
        
        // 使用済み選手を避けてランダム選手を選択
        const availablePlayers = players.filter(player => 
            !this.usedPlayers.includes(player.name)
        );
        
        if (availablePlayers.length === 0) {
            // 全選手使用済みの場合はリセット
            this.usedPlayers = [];
        }
        
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        this.currentPlayer = availablePlayers[randomIndex];
        this.usedPlayers.push(this.currentPlayer.name);
        
        // 選手情報を表示
        this.displayPlayer();
        
        // 選択肢を生成
        this.generateChoices();
        
        // UI更新
        this.updateScoreDisplay();
        this.hideFeedback();
        this.enableChoices();
    }
    
    displayPlayer() {
        this.playerImage.src = this.currentPlayer.image;
        this.playerImage.alt = this.currentPlayer.name + 'の画像';
        this.playerName.textContent = this.currentPlayer.name;
    }
    
    generateChoices() {
        const correctNumber = this.currentPlayer.number;
        const wrongNumbers = [];
        
        // 他の選手の背番号から3つの不正解選択肢を生成
        const otherNumbers = players
            .map(player => player.number)
            .filter(number => number !== correctNumber);
        
        while (wrongNumbers.length < 3 && otherNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherNumbers.length);
            const randomNumber = otherNumbers[randomIndex];
            
            if (!wrongNumbers.includes(randomNumber)) {
                wrongNumbers.push(randomNumber);
            }
            
            otherNumbers.splice(randomIndex, 1);
        }
        
        // 4つの選択肢（正解1つ + 不正解3つ）をシャッフル
        const allChoices = [correctNumber, ...wrongNumbers];
        this.shuffleArray(allChoices);
        
        // ボタンに選択肢を設定
        this.choiceBtns.forEach((btn, index) => {
            btn.textContent = allChoices[index];
            btn.setAttribute('data-number', allChoices[index]);
            btn.className = 'choice-btn'; // クラスをリセット
        });
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    handleAnswer(event) {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        const selectedNumber = parseInt(event.target.getAttribute('data-number'));
        const correctNumber = this.currentPlayer.number;
        const isCorrect = selectedNumber === correctNumber;
        
        // 正解の場合スコア更新
        if (isCorrect) {
            this.score++;
            this.updateScoreDisplay();
        }
        
        // ボタンの色を変更
        this.choiceBtns.forEach(btn => {
            const btnNumber = parseInt(btn.getAttribute('data-number'));
            if (btnNumber === correctNumber) {
                btn.classList.add('correct');
            } else if (btnNumber === selectedNumber && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // フィードバック表示
        this.showFeedback(isCorrect);
        this.disableChoices();
    }
    
    showFeedback(isCorrect) {
        this.feedback.classList.remove('hidden');
        this.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            this.feedbackText.textContent = '正解！ 🎉';
        } else {
            this.feedbackText.textContent = `不正解... 正解は ${this.currentPlayer.number} 番でした。`;
        }
        
        // 次の問題ボタンまたは結果表示の設定
        if (this.currentQuestion >= this.totalQuestions) {
            this.nextBtn.textContent = '結果を見る';
        } else {
            this.nextBtn.textContent = '次の問題';
        }
    }
    
    hideFeedback() {
        this.feedback.classList.add('hidden');
    }
    
    enableChoices() {
        this.choiceBtns.forEach(btn => {
            btn.disabled = false;
        });
    }
    
    disableChoices() {
        this.choiceBtns.forEach(btn => {
            btn.disabled = true;
        });
    }
    
    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.showResults();
        } else {
            this.loadNextQuestion();
        }
    }
    
    showResults() {
        this.gameScreen.classList.add('hidden');
        this.resultScreen.classList.remove('hidden');
        
        const accuracy = Math.round((this.score / this.totalQuestions) * 100);
        
        this.finalScoreEl.textContent = this.score;
        this.finalTotalEl.textContent = this.totalQuestions;
        this.accuracyEl.textContent = accuracy;
    }
    
    showGameScreen() {
        this.gameScreen.classList.remove('hidden');
        this.resultScreen.classList.add('hidden');
    }
    
    updateScoreDisplay() {
        this.currentQuestionEl.textContent = `問題 ${this.currentQuestion}`;
        this.totalQuestionsEl.textContent = this.totalQuestions;
        this.scoreEl.textContent = this.score;
    }
}

// ページ読み込み完了後にゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    new GuessTheNumberGame();
});
