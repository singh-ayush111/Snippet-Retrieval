async function fetchSnippet() {
    const keyword = document.getElementById('keywordInput').value;
    const display = document.getElementById('codeDisplay');
    const copyBtn = document.getElementById('copyBtn');

    if (!keyword) return alert("Please enter a keyword");

    try {
        const response = await fetch(`/api/snippet/${keyword}`);
        const data = await response.json();

        if (data.success) {
            display.textContent = data.code;
            copyBtn.classList.remove('hidden');
        } else {
            display.textContent = "// No snippet found for this keyword.";
            copyBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        display.textContent = "// Error connecting to server.";
    }
}

function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    alert("Code copied!");
}


async function saveSnippet() {
    const keywordInput = document.getElementById('newKeyword');
    const codeInput = document.getElementById('newCode');
    
    const keyword = keywordInput.value.trim();
    const code = codeInput.value.trim();

    if (!keyword || !code) {
        return alert("Please fill in both the keyword and the code.");
    }

    try {
        const response = await fetch('/api/snippet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword, code })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            keywordInput.value = '';
            codeInput.value = '';
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Failed to connect to the server.");
    }
}