const elements = {
    "수소": "H", "헬륨": "He", "리튬": "Li", "베릴륨": "Be", "붕소": "B",
    "탄소": "C", "질소": "N", "산소": "O", "플루오린": "F", "네온": "Ne",
    "나트륨": "Na", "소듐": "Na", "마그네슘": "Mg", "알루미늄": "Al", "규소": "Si", "인": "P",
    "황": "S", "염소": "Cl", "아르곤": "Ar", "칼륨": "K", "포타슘": "K", "칼슘": "Ca",
    "철": "Fe", "구리": "Cu", "아연": "Zn", "은": "Ag", "금": "Au",
    "아이오딘": "I", "납": "Pb", "수은": "Hg", "망가니즈": "Mn", "바륨": "Ba"
};

// Na, K 등 여러 정답이 존재하는 경우
const alternativeAnswers = {
    "Na": ["나트륨", "소듐"],
    "K": ["칼륨", "포타슘"]
};

let questions = [];
let usedElements = new Set(); // 중복 방지용 집합
let wrongAnswers = []; // 틀린 문제 저장
let currentQuestion = {};
let score = 0;
let quizStarted = false;
let waitingForNext = false; // 오답 후 '확인'을 눌러야 넘어가도록 설정
let questionNumber = 0; // 현재 문제 번호

// 20문제 생성 함수 (동일 원소 중복 방지)
function generateQuestions() {
    const elementNames = Object.keys(elements);
    let tempQuestions = [];

    elementNames.forEach(name => {
        if (name === "소듐" || name === "포타슘") return; // 중복 문제 방지
        tempQuestions.push({ type: "name", question: name, answer: elements[name] });
        tempQuestions.push({ type: "symbol", question: elements[name], answer: name });
    });

    // 문제를 섞음
    tempQuestions = tempQuestions.sort(() => Math.random() - 0.5);

    // 동일한 원소에 대해 한 번만 출제 (이름 ↔ 기호 중 하나만)
    questions = [];
    tempQuestions.forEach(q => {
        if (!usedElements.has(q.question) && !usedElements.has(q.answer)) {
            usedElements.add(q.question);
            usedElements.add(q.answer);
            questions.push(q);
        }
    });

    // 20문제만 선택
    questions = questions.slice(0, 20);
}

// 다음 문제 출제 함수
function getNextQuestion() {
    if (questions.length === 0) {
        endQuiz();
        return;
    }

    questionNumber++; // 문제 번호 증가
    waitingForNext = false; // 오답 후 다시 입력 가능하게 초기화
    document.getElementById("answer").disabled = false;
    document.getElementById("submit").innerText = "확인";

    currentQuestion = questions.shift();

    if (currentQuestion.type === "name") {
        document.getElementById("question").innerText = `${questionNumber}. 원소 "${currentQuestion.question}"의 기호는?`;
    } else {
        document.getElementById("question").innerText = `${questionNumber}. "${currentQuestion.question}"의 원소 이름은?`;
    }

    document.getElementById("answer").value = "";
    document.getElementById("message").innerText = "";

    // 입력창에 커서 유지
    document.getElementById("answer").focus();
}

// 정답 확인 함수
function checkAnswer() {
    if (!quizStarted || waitingForNext) return;

    let userAnswer = document.getElementById("answer").value.trim();
    let correctAnswer = currentQuestion.answer;

    // 예외적으로 인정되는 정답 처리 (Na, K)
    if (alternativeAnswers[currentQuestion.question]) {
        if (alternativeAnswers[currentQuestion.question].includes(userAnswer)) {
            document.getElementById("message").innerText = "정답입니다! 🎉";
            score++;
        } else {
            showWrongAnswer();
            return;
        }
    } else {
        if (userAnswer === correctAnswer) {
            document.getElementById("message").innerText = "정답입니다! 🎉";
            score++;
        } else {
            showWrongAnswer();
            return;
        }
    }

    document.getElementById("answer").disabled = true; // 정답 맞추면 입력 비활성화
    setTimeout(getNextQuestion, 1200); // 1.2초 후 다음 문제 출제
}

// 오답 시 정답을 보여주고, "확인"을 누르면 넘어가도록 설정
function showWrongAnswer() {
    document.getElementById("message").innerText = `오답입니다. 정답은 ${currentQuestion.answer} 입니다.`;
    wrongAnswers.push(currentQuestion.question); // 틀린 문제 저장
    waitingForNext = true;
    document.getElementById("submit").innerText = "다음 문제";
}

// 퀴즈 종료 후 결과 표시
function endQuiz() {
    quizStarted = false;
    let resultMessage = `퀴즈 종료! 최종 점수: ${score} / 20\n\n`;

    if (wrongAnswers.length > 0) {
        resultMessage += `✅틀린 문제 \n${wrongAnswers.join(", ")}`;
    } else {
        resultMessage += "모든 문제를 맞췄습니다! 🎉";
    }

    document.getElementById("question").innerText = resultMessage;
    document.getElementById("message").innerText = "";
    document.getElementById("answer").style.display = "none";
    document.getElementById("submit").style.display = "none";
    document.getElementById("score").style.display = "block"; // 점수 표시
    document.getElementById("score").innerText = `최종 점수: ${score} / 20`; 
    document.getElementById("start").style.display = "inline-block";
}

// 퀴즈 시작
function startQuiz() {
    quizStarted = true;
    score = 0;
    questionNumber = 0; // 문제 번호 초기화
    usedElements.clear(); // 중복 방지를 위해 초기화
    wrongAnswers = []; // 틀린 문제 초기화
    document.getElementById("answer").style.display = "inline-block";
    document.getElementById("submit").style.display = "inline-block";
    document.getElementById("score").innerText = ""; // 점수 숨김
    document.getElementById("start").style.display = "none";

    generateQuestions();
    getNextQuestion();
}

// Enter 키로 정답 제출 가능하게 설정
document.getElementById("answer").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !waitingForNext) {
        event.preventDefault();
        checkAnswer();
    } else if (event.key === "Enter" && waitingForNext) {
        event.preventDefault();
        getNextQuestion();
    }
});

// '확인' 버튼을 눌렀을 때 동작 변경 (오답 후 넘어가는 기능 추가)
document.getElementById("submit").addEventListener("click", function() {
    if (waitingForNext) {
        getNextQuestion();
    } else {
        checkAnswer();
    }
});

// 페이지 로드 시 버튼 상태 설정
window.onload = function () {
    document.getElementById("answer").style.display = "none";
    document.getElementById("submit").style.display = "none";
};