const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

$('#dark-mode-toggle').onclick = () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode',isDarkMode);
    // chang mobile status bar color
    $('meta[name="theme-color"]').setAttribute('content',isDarkMode? '#1a1a2e': '#fff');

}
// screen
const start_screen = $('#start-screen');
const game_screen = $('#game-screen');
const pause_screen = $('#pause-screen');
const result_screen = $('#result-screen')

// initial value

const cells = $$('.main-grid-cell');

const name_input = $('#input-name');

const number_input = $$('.number');

const player_name = $('#player-name');
const game_level  = $('#game-level');
const game_time = $('#game-time');
const result_time = $('#result-time');

let level_index = 0;
let level = CONSTANT.LEVELS[level_index];
let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;
// -------




// add value for each 9 cells
const initGameGrid = () => {
    let index = 0;
    for(let i=0;i<Math.pow(CONSTANT.GRID_SIZE,2);i++){
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i%CONSTANT.GRID_SIZE;
        if(row === 2 || row === 5) cells[i].style.marginBottom = '10px';
        if(col === 2 || col === 5) cells[i].style.marginRight = '10px';

    }
}

// --------------------

const setPlayerName = (name) => localStorage.setItem('player_name',name);
const getPlayerName = () => localStorage.getItem('player_name')

const showTime = (seconds) => new Date(seconds *1000).toISOString().substr(11,8);

const clearSudoku = () => {
    for(let i=0;i<Math.pow(CONSTANT.GRID_SIZE,2);i++){
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled')
        cells[i].classList.remove('selected')

    }
}

const initSudoku = () => {
    // clear old sudoku
    clearSudoku();
    resetBg();
    // generate puzzle sudoku here
    su = sudokuGen(level);
    su_answer = [...su.question];
    seconds = 0;
    saveGameInfo();

    // show sudoku to div

    for(let i=0;i<Math.pow(CONSTANT.GRID_SIZE,2);i++){
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i%CONSTANT.GRID_SIZE;
        cells[i].setAttribute('data-value',su.question[row][col]);
        if(su.question[row][col] !== 0){
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const hoverBg = (index) =>{
    let row = Math.floor(index/CONSTANT.GRID_SIZE);
    let col = index%CONSTANT.GRID_SIZE;

    let box_start_row = row - row%3;
    let box_start_col = col - col%3

    for(let i = 0;i< CONSTANT.BOX_SIZE;i++){
        for(let j=0;j<CONSTANT.BOX_SIZE;j++){
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover')
        }
    }

    let step = 9;
    while(index - step >= 0){
        cells[index - step].classList.add('hover');
        step += 9;
    }
    step = 9;
    while(index + step < 81){
        cells[index + step].classList.add('hover');
        step += 9;
    }
    
    step=1;
    while(index - step >= 9*row){
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step=1;
    while(index + step < 9*row + 9){
        cells[index + step].classList.add('hover');
        step += 1;
    }
    
}

const resetBg = () => {
    cells.forEach((e) => e.classList.remove('hover'));
}

const checkErr = (value) => {
    const addErr = (cell) => {
        if(parseInt(cell.getAttribute('data-value')) === value){
            cell.classList.add('err');
            cell.classList.add('cell-err');
        }
        setTimeout(() => {
            cell.classList.remove('cell-err')
        },500)
    }
    let index = selected_cell;

    let row = Math.floor(index/CONSTANT.GRID_SIZE);
    let col = index%CONSTANT.GRID_SIZE;

    let box_start_row = row - row%3;
    let box_start_col = col - col%3

    for(let i = 0;i< CONSTANT.BOX_SIZE;i++){
        for(let j=0;j<CONSTANT.BOX_SIZE;j++){
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            if(!cell.classList.contains('selected')) addErr(cell)
        }
    }

    let step = 9;
    while(index - step >= 0){
        addErr(cells[index - step]);
        step += 9;
    }
    step = 9;
    while(index + step < 81){
        addErr(cells[index + step]);
        step += 9;
    }
    
    step=1;
    while(index - step >= 9*row){
        addErr(cells[index - step]);
        step += 1;
    }

    step=1;
    while(index + step < 9*row + 9){
        addErr(cells[index + step]);
        step += 1;
    }
}

const removeErr = () => {
    cells.forEach((e,index) => {
        e.classList.remove('err');
    })
}

const loadSudoku = () => {
    let game = getGameInfo();
    console.log(game);
    game_level.innerHTML = CONSTANT.LEVEL_NAMES[game.level];

    su = game.su;

    su_answer = su.answer;

    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);

    level_index = game.level;

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !==0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds:seconds,
        su:{
            original:su.original,
            question:su.question,
            answer:su_answer
        }
    }
    localStorage.setItem('game',JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    $('#btn-continue').style.display = 'none';
}
const isGameWin = () => {
    sudokuCheck(su_answer);
    console.log(sudokuCheck(su_answer));
    return sudokuCheck(su_answer)
}

const showResult = () => {
    clearInterval(timer);
    // show result screen
    result_screen.classList.add('active');
    result_time.innerHTML = showTime(seconds);
}

const initNumberInputEvent = () => {
    number_input.forEach((e,index) => {
        e.onclick = () => {
            console.log(2)
            if(!cells[selected_cell].classList.contains('filled')){
                cells[selected_cell].innerHTML = index + 1;
                cells[selected_cell].setAttribute('data-value',index + 1);
                // add the answer

                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col =selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;

                // save game
                saveGameInfo();
                // --------
                removeErr();
                checkErr(index+1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                },500)
                // check game win
                if(isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
                // ------
            }
        }
    })
}

const initCellsEvent = () => {
    cells.forEach((e,index) => {
        e.onclick = () => {
            console.log(1)
            if(!e.classList.contains('filled')){
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        }
    })
}


const startGame  = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value;
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAMES[level_index];

    seconds = 0;
    showTime(seconds);

    timer = setInterval(() =>{
        if(!pause){
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
        }
    },1000)
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause=false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}
const getGameInfo = () => JSON.parse(localStorage.getItem('game'));
// add button events
$('#btn-level').onclick = (e) =>{
    level_index = level_index + 1 > CONSTANT.LEVELS.length - 1 ? 0 : level_index + 1;
    level =CONSTANT.LEVELS[level_index] 
    e.target.innerHTML = CONSTANT.LEVEL_NAMES[level_index];
}


$('#btn-play').onclick = ()=>{
    if(name_input.value.trim().length > 0){
        initSudoku();
        startGame();
    }else{
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        },500)
    }
}

$('#btn-continue').onclick = ()=>{
    if(name_input.value.trim().length > 0){
        startGame();
        loadSudoku();
    }else{
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        },500)
    }
}

$('#btn-pause').onclick = () => {
    pause_screen.classList.add('active');
    pause = true;
};
$('#btn-resume').onclick = () => {
    pause_screen.classList.remove('active');
    pause = false;
};
$('#btn-new-game').onclick = () => {
    returnStartScreen();
}
$('#btn-new-game-2').onclick = () => {
    returnStartScreen();
}
$('#btn-delete').onclick = () => {
    cells[selected_cell].innerHTML='';
    cells[selected_cell].setAttribute('data-value',0);
    
    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;
    removeErr();
}
// ------------------



const init = () => {
    const darkMode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkMode? 'dark': 'light');
    $('meta[name="theme-color"]').setAttribute('content',darkMode? '#1a1a2e': '#fff');
    
    const game = getGameInfo();

    $('#btn-continue').style.display = game ? 'grid':'none'
    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();


    if(getPlayerName()){
        name_input.value = getPlayerName();
    }
    else{
        name_input.focus();
    }
}

init();


