// Get the necessary elements from the DOM
const englishText = document.getElementById('english-text') as HTMLInputElement;
const playButton = document.getElementById('play-button') as HTMLButtonElement;
const keyword = document.getElementById('keyword') as HTMLInputElement;
const checkButton = document.getElementById('check-button') as HTMLButtonElement;
const result = document.getElementById('result') as HTMLElement;
const countdownElement = document.getElementById('countdown') as HTMLElement;
const keywordScoresElement = document.getElementById('keyword-scores') as HTMLElement;

// Disable keyword input initially
keyword.disabled = true;

// Function to calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = [];

    for (let i = 0; i <= m; i++) {
        dp[i] = [];
        dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1, // insertion
                    dp[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }

    return dp[m][n];
}

// Function to handle the play button click event
if (playButton && englishText && countdownElement) {
    playButton.addEventListener('click', () => {
        // Disable play button
        playButton.disabled = true;
        const text = englishText.value;
        // Enable keyword input
        keyword.disabled = false;

        // Focus on keyword input
        keyword.focus();
        if (text) {
            // Countdown before playing
            let count = 3;
            const countdownInterval = setInterval(() => {
                if (count > 0) {
                    countdownElement.innerText = count.toString();
                    console.log(count)
                    count--;
                } else {
                    clearInterval(countdownInterval);
                    countdownElement.innerText = '';
                    // Use text-to-speech API to read the English text
                    const speech = new SpeechSynthesisUtterance();
                    speech.lang = 'en-US';
                    speech.text = text;
                    speech.volume = 1;
                    speech.rate = 1;
                    speech.pitch = 1;
                    window.speechSynthesis.speak(speech);
                    console.log('Playing')
                }
            }, 1000);
        }
    });
}

// Function to handle the check button click event
if (checkButton && englishText && keyword) {
    checkButton.addEventListener('click', function () {
        var text = englishText.value;
        var userKeyword = keyword.value;
        if (text && userKeyword) {
            // Split the text and keyword into arrays of words
            var textWords = text.split(' ');
            var keywordWords = userKeyword.split(' ');
            // Calculate the similarity score for each word in the text
            var matchScores = textWords.map(function (word) {
                var bestMatch = keywordWords.reduce(function (maxMatch, keyword) {
                    var match = calculateMatch(word, keyword);
                    return Math.max(maxMatch, match);
                }, 0);
                return bestMatch;
            });
            // Create an array of keyword-score pairs
            var keywordScores = keywordWords.map(function (keyword, index) {
                return {
                    keyword: keyword,
                    score: matchScores[index]
                };
            });
            // Display the keyword-score pairs
            keywordScores.forEach(function (pair) {
                const scoreElement = document.createElement('p');
                scoreElement.innerText = `${pair.keyword}: ${pair.score.toFixed(2)}`;
                keywordScoresElement.appendChild(scoreElement);
            });
        }
    });
}

// Function to calculate the match score between two words
function calculateMatch(word1, word2) {
    var distance = levenshteinDistance(word1, word2);
    var maxLength = Math.max(word1.length, word2.length);
    var matchScore = (maxLength - distance) / maxLength;
    return matchScore;
}