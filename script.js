document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');
    const nameListItems = document.querySelectorAll('#tab1 .name-list ul li');

    // Function to select a tab
    function selectTab(tabId) {
        const tab = document.querySelector(`[data-tab="${tabId}"]`);
        tab.classList.add('selected');

        // Show content of the selected tab and hide others
        contents.forEach(content => {
            if (content.id === tabId) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }

    // Select the first tab as soon as the page loads
    selectTab('tab1');

    // Event listener for tab clicks
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = tab.getAttribute('data-tab');

            // Remove 'selected' class from all tabs
            tabs.forEach(otherTab => {
                otherTab.classList.remove('selected');
            });

            // Select the clicked tab
            selectTab(tabId);
        });
    });

    // Event listener for name list item clicks
    nameListItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle selected class
            item.classList.toggle('selected');

            // Toggle background color
            if (item.classList.contains('selected')) {
                item.style.backgroundColor = '#aaf'; // Change this to the desired color
            } else {
                item.style.backgroundColor = ''; // Reset to default color
            }

            // Print the selected name to the console
            if (item.classList.contains('selected')) {
                console.log("Selected name:", item.textContent);
            } else {
                console.log("Deselected name:", item.textContent);
            }

            // Deselect other items and reset their colors
            nameListItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('selected')) {
                    otherItem.classList.remove('selected');
                    otherItem.style.backgroundColor = ''; // Reset to default color
                }
            });
        });
    });
});

// Function to add a new message to the chat and scroll to the last message
function addMessage(message) {
    const textScroller = document.querySelector('.text-scroller');
    textScroller.innerHTML += message + "<br>";

    // Scroll to the last message
    textScroller.scrollTo(0, textScroller.scrollHeight);
}

document.addEventListener("DOMContentLoaded", function() {
    const textArea = document.querySelector('.input-textarea');
    console.log("bora");
    textArea.addEventListener('keydown', function(event) {
        // Check if Enter key is pressed
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line in textarea
            const message = textArea.value.replace(/\r?\n|\r/g, '<br>'); // Get message content
            if (message !== '') {
                addMessage(message); // Add message
                textArea.value = ''; // Clear textarea
            }
        }
    });
});

function addContact(){
    console.log("add");
}

// Example: Add a new message every 2 seconds
setInterval(function() {
    const messages = [
        "Error: Missing semicolon at line 10",
        "Error: Variable 'x' is undefined",
        "Warning: Unused import 'lodash'",
        "Error: Function 'calculate' expects 2 arguments, but only 1 provided",
        "Error: SyntaxError: Unexpected token '<' at line 20",
        "Error: Cannot read property 'toUpperCase' of undefined",
        "Warning: Function 'getData' is deprecated",
        "Error: File not found: 'styles.css'",
        "Error: ModuleNotFoundError: Module 'react' not found",
        "Warning: Possible memory leak detected",
        "Error: Uncaught TypeError: Cannot read property 'length' of null",
        "Error: Function 'render' must return a valid React element",
        "Warning: Unused variable 'unusedVar'",
        "Error: ReferenceError: 'myFunction' is not defined",
        "Error: Invalid syntax in 'package.json'",
        "Warning: Variable 'i' is redeclared",
        "Error: Out of memory: heap overflow",
        "Error: TypeError: Cannot read property 'map' of undefined",
        "Error: UnhandledPromiseRejectionWarning: Promise rejected",
        "Error: Class 'App' does not implement method 'render'",
        "Warning: Missing 'key' prop for list items",
        "Error: Function 'fetchData' failed to fetch data",
        "Error: Internal server error (500)",
        "Error: NetworkError: Failed to fetch",
        "Warning: Deprecated method 'componentWillMount'",
        "Error: Unexpected end of input",
        "Error: Function 'calculateTotal' is not a function",
        "Warning: Possible infinite loop detected",
        "Error: Maximum call stack size exceeded",
        "Error: TypeError: Cannot read property 'push' of null",
        "Warning: Unused function 'unusedFunction'",
        "Error: File is not a valid JavaScript file",
        "Error: SyntaxError: Unexpected token ',' at line 5",
        "Warning: 'async' function without 'await' expression",
        "Error: Uncaught RangeError: Maximum call stack size exceeded",
        "Error: TypeError: Cannot read property 'addEventListener' of null",
        "Error: Unexpected identifier: 'const'",
        "Error: TypeError: Cannot read property 'length' of undefined",
        "Warning: Variable 'unusedVar' is declared but never used",
        "Error: Invalid regular expression",
        "Error: TypeError: Cannot read property 'slice' of undefined",
        "Warning: Function 'getData' may cause performance issues",
        "Error: File not found: 'index.html'",
        "Error: TypeError: Cannot read property 'toUpperCase' of null",
        "Error: TypeError: Cannot read property 'toString' of undefined",
        "Warning: Variable 'i' is used before it's declared",
        "Error: SyntaxError: Unexpected token '=' at line 15",
        "Error: TypeError: Cannot set property 'value' of null",
        "Warning: Function 'render' should be a pure function",
        "Error: TypeError: Cannot read property 'length' of null",
        "Error: SyntaxError: Invalid or unexpected token",
        "Error: TypeError: Cannot read property 'forEach' of undefined",
        "Warning: Unreachable code detected",
        "Error: TypeError: Cannot read property 'substring' of undefined",
        "Error: RangeError: Invalid array length",
        "Warning: 'console.log' statement detected",
        "Error: TypeError: Cannot read property 'getAttribute' of null",
        "Error: TypeError: Cannot read property 'filter' of undefined",
        "Warning: Function 'calculate' is deprecated",
        "Error: TypeError: Cannot read property 'split' of undefined",
        "Error: TypeError: Cannot read property 'join' of undefined",
        "Warning: Function 'getData' may be asynchronous",
        "Error: TypeError: Cannot read property 'querySelector' of null",
        "Error: TypeError: Cannot read property 'reduce' of undefined",
        "Error: SyntaxError: Unexpected end of JSON input",
        "Error: TypeError: Cannot read property 'push' of undefined",
        "Error: TypeError: Cannot read property 'find' of undefined",
        "Warning: Missing 'alt' attribute for <img> tag",
        "Error: TypeError: Cannot read property 'indexOf' of null",
        "Error: TypeError: Cannot read property 'toUpperCase' of undefined",
        "Warning: Possible memory leak detected",
        "Error: TypeError: Cannot read property 'toLowerCase' of undefined",
        "Error: TypeError: Cannot read property 'length' of undefined",
        "Error: ReferenceError: 'document' is not defined",
        "Warning: Function 'getData' has too many arguments",
        "Error: TypeError: Cannot read property 'toFixed' of undefined",
        "Error: TypeError: Cannot read property 'trim' of undefined",
        "Warning: '=='' should be '===' for strict comparison",
        "Error: TypeError: Cannot read property 'findIndex' of undefined",
        "Error: SyntaxError: Unexpected token '<' at line 10",
        "Error: TypeError: Cannot read property 'getAttribute' of null",
        "Error: TypeError: Cannot read property 'charAt' of undefined",
        "Warning: Unused variable 'unusedVar'",
        "Error: TypeError: Cannot read property 'classList' of null",
        "Error: TypeError: Cannot read property 'log' of undefined",
        "Error: TypeError: Cannot read property 'substr' of undefined",
        "Warning: Function 'calculate' is deprecated",
        "Error: TypeError: Cannot read property 'push' of null",
        "Error: SyntaxError: Unexpected token '=>' at line 15",
        "Warning: Variable 'i' is redeclared",
        "Error: TypeError: Cannot read property 'replace' of undefined",
        "Error: TypeError: Cannot read property 'find' of undefined",
        "Error: TypeError: Cannot read property 'includes' of undefined",
        "Warning: Function 'getData' may cause performance issues",
        "Error: TypeError: Cannot read property 'setAttribute' of null",
        "Error: TypeError: Cannot read property 'removeChild' of null",
        "Error: SyntaxError: Unexpected token '<' at line 20",
        "Warning: 'async' function without 'await' expression",
        "Error: ReferenceError: 'myFunction' is not defined",
        "Error: TypeError: Cannot read property 'querySelectorAll' of null",
        "Warning: 'console.log' statement detected",
        "Error: TypeError: Cannot read property 'style' of null",
        "Error: TypeError: Cannot read property 'map' of undefined",
        "Warning: Function 'getData' may be asynchronous"
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    addMessage(messages[randomIndex]);
}, 2000);

