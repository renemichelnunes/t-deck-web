let ws = null;
let contactID = "";
let editContactID = "";
let contactName = "";

let contextMenu = document.querySelector('.contextMenu');
let currentTarget = null;

x = 0;
y = 0;

function showContextMenu(event, id, name) {
    event.preventDefault();
    currentTarget = event.currentTarget;
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.clientX + 'px';
    contextMenu.style.top = event.clientY + 'px';
    contextMenu.setAttribute('data-id', id);
    contextMenu.setAttribute('data-name', name);
    console.log("id " + id + " " + name);
    document.addEventListener('mousedown', handleOutsideClick);
}

function handleOutsideClick(event) {
    if (!contextMenu.contains(event.target) && event.target !== currentTarget) {
        hideContextMenu();
    }
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    document.removeEventListener('mousedown', handleOutsideClick);
}

function edit(event) {
    event.stopPropagation();
    let id = contextMenu.getAttribute('data-id');
    let name = contextMenu.getAttribute('data-name');
    editContact(id, name);
    hideContextMenu();
}

function remove(event) {
    event.stopPropagation();
    let id = contextMenu.getAttribute('data-id');
    if(window.confirm('Delete contact?')){
        if(ws !== null){
            ws.send(JSON.stringify({"command" : "del_contact", "id" : id}));
        }
    }
    hideContextMenu();
}

document.getElementById('editContact').addEventListener('click', edit);
document.getElementById('deleteContact').addEventListener('click', remove);

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
});

function loadConstacts(contactList) {
    const nameList = document.querySelector('.name-list ul');
    nameList.innerHTML = "";
    let selectedListItem = null;

    contactList.contacts.forEach(function(c) {
        const name = c.name;
        const id = c.id;
        const status = c.status;

        const listItem = document.createElement('li');
        listItem.oncontextmenu = function(event){
            showContextMenu(event, id, name);
        };
        const listItemContent = document.createElement('div'); // Create a div for the content
        listItemContent.textContent = name;

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = id;

        const statusDiv = document.createElement('div');
        statusDiv.id = 'status';
        if(status === 'on')
            statusDiv.className = 'status-on';
        else
            statusDiv.className = 'status';

        listItem.appendChild(hiddenInput);
        listItem.appendChild(listItemContent); // Append the div content to the li
        nameList.appendChild(listItem);

        listItemContent.appendChild(statusDiv);

        const last_msg = document.createElement('div');
        last_msg.textContent = 'is there a way using only css to limit a text to a fized size?';
        last_msg.classList = 'last_msg';
        listItem.appendChild(last_msg);

        // Add event listener to each list item
        listItem.addEventListener('click', function() {
            // Remove background color from previously selected item
            if (selectedListItem !== null) {
                selectedListItem.style.backgroundColor = '';
            }

            // Change background color of the clicked item
            listItem.style.backgroundColor = '#ffe4c4'; // Change to your desired background color
            selectedListItem = listItem;

            const selectedName = name;
            const selectedId = id;
            contactID = id;
            contactName = name;
            ws.send(JSON.stringify({"command" : "sel_contact", "id" : contactID}));
            console.log("Selected name: " + selectedName + ", ID: " + selectedId);
        });
    });
};

// Function to add a new message to the chat and scroll to the last message
function addMessage(message) {
    const textScroller = document.querySelector('.text-scroller');

    textScroller.append(message);
    textScroller.appendChild(document.createElement("br"));
    // Scroll to the last message
    textScroller.scrollTo(0, textScroller.scrollHeight);
}

function sendMesage(cid, message){
    const data = {
        command : 'send',
        id : cid,
        msg : message
    }
    if(ws !== null)
        ws.send(JSON.stringify(data));
}

document.addEventListener("DOMContentLoaded", function() {
    const textArea = document.querySelector('.input-textarea');
    textArea.addEventListener('keydown', function(event) {
        // Check if Enter key is pressed
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line in textarea
            const message = textArea.value.replace(/\r?\n|\r/g, '<br>'); // Get message content
            if (message !== '') {
                var currentDate = new Date();
                var formattedDate = formatDate(currentDate);
                sendMesage(contactID, message.replace(/<br>/g, '\n'));
                add_contact_msg('Me', formattedDate, message);
                textArea.value = ''; // Clear textarea
            }
        }
    });
});

function formatDate(date) {
    // Get day, month, year, hours, and minutes
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    var year = date.getFullYear();
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Concatenate the parts to form the desired format
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function isJSONObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function add_contact_msg(name, msg_date, msg){
    var div_contact = document.createElement('div');
    var textScroller = document.querySelector('.text-scroller')
    if(name !== "Me"){
        div_contact.className = 'contact_header';
    }
    else{
        div_contact.className = 'contact_header2'
    }
    div_contact.append(name + ' ' + msg_date);
    div_contact.appendChild(document.createElement('br'));
    div_contact.innerHTML += msg;
    textScroller.appendChild(div_contact);
    textScroller.scrollTo(0, textScroller.scrollHeight);
}

function parseData(data){
    try{
        let decData = JSON.parse(data);
        if(isJSONObject(decData)){
            if(decData.command === "contacts"){
                loadConstacts(decData);
            }else if(decData.command === "msg_list"){
                document.querySelector('.text-scroller').innerHTML = "";
                decData.messages.forEach(function(m){
                    add_contact_msg(contactName, m.msg_date, m.msg);
                });
            }else if(decData.command === "notification"){
                alert(decData.message);
            }
        }else{
            addMessage(data);
        }
    }catch{
        addMessage(data);
    }
}

function clear_contacts_and_messages(){
    document.querySelector('.text-scroller').innerHTML = "";
    document.querySelector('.name-list ul').innerHTML = "";
}

function addContact(){
    console.log("add");
    ws = new WebSocket(location.protocol === 'https:' ? 'wss://' + window.location.host + ':9501' : 'ws://' + window.location.host + ':9501');
    ws.onopen = function(e){
        console.log(e);
    };
    ws.onerror = function(e){
        console.log(e);
    };
    ws.onmessage = function(e){
        parseData(e.data);
        console.log(e);
    };
    ws.onclose = function(e){
        clear_contacts_and_messages();
        console.log("Disconnected");
    }
};

function delContact(){
    console.log('del');
    if(ws !== null){
        ws.close();
        ws = null;
        console.log('closed');
    }
};

function showNew() {
    document.getElementById("divNew").style.display = "block";
    document.getElementById("divNew").style.left = x + 'px';
    document.getElementById("divNew").style.top = y + 'px';
}

function hideNew() {
    document.getElementById("divNew").style.display = "none";
}

function confirmNew() {
    let id = document.getElementById("CID").value;
    let name = document.getElementById("CName").value;
    if(ws !== null)
        ws.send(JSON.stringify({"command" : "new_contact",
                                "id" : id,
                                "name" : name}));
    hideNew(); // For demonstration, hiding modal after confirmation
}

function newContact(){
    showNew();
}

function showEdit(id, name){
    document.getElementById("divEdit").style.display = "block";
    document.getElementById("divEdit").style.left = x + 'px';
    document.getElementById("divEdit").style.top = y + 'px';
    document.getElementById("CIDedit").value = id;
    document.getElementById("CNameedit").value = name;
    editContactID = id;
}

function hideEdit(){
    document.getElementById("divEdit").style.display = "none";
}

function confirmEdit(){
    if(ws !== null){
        ws.send(JSON.stringify({"command" : "edit_contact", 
                                "id" : editContactID,
                                "newid" : document.getElementById("CIDedit").value,
                                "newname" : document.getElementById("CNameedit").value}));
    }
    editContactID = "";
    hideEdit();
}

function editContact(id, name){
    showEdit(id, name);
}

function getMouseCoordinates(event) {
    const x = event.clientX;
    const y = event.clientY;
    return { x: x, y: y };
}

document.addEventListener('mousemove', function(event) {
    const coordinates = getMouseCoordinates(event);
    x = coordinates.x;
    y = coordinates.y;
});

// Example: Add a new message every 2 seconds
/*
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
*/
