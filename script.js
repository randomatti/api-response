// Console hata yakalayıcı
window.onerror = function(msg, url, lineNo, columnNo, error) {
    showErrorModal('JavaScript Error', {
        message: msg,
        location: `${url} (line: ${lineNo}, column: ${columnNo})`,
        stack: error?.stack
    });
    return false;
};

// Console yakalayıcılar
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

console.log = function() {
    showErrorModal('Console Log', formatConsoleArgs(arguments));
    originalConsole.log.apply(console, arguments);
};

console.warn = function() {
    showErrorModal('Console Warning', formatConsoleArgs(arguments));
    originalConsole.warn.apply(console, arguments);
};

console.error = function() {
    showErrorModal('Console Error', formatConsoleArgs(arguments));
    originalConsole.error.apply(console, arguments);
};

// Promise hata yakalayıcı
window.addEventListener('unhandledrejection', function(event) {
    showErrorModal('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
    });
});

// Yardımcı fonksiyonlar
function formatConsoleArgs(args) {
    return Array.from(args).map(arg => {
        if (arg instanceof Error) {
            return {
                name: arg.name,
                message: arg.message,
                stack: arg.stack
            };
        }
        return arg;
    });
}

function formatError(error) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
    if (typeof error === 'string') {
        return { message: error };
    }
    return error;
}

function showErrorModal(title, error) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorDetails = document.getElementById('errorDetails');

    errorMessage.innerHTML = `<strong>${title}</strong>`;
    
    const formattedError = formatError(error);
    errorDetails.textContent = JSON.stringify(formattedError, null, 2);

    modal.style.display = 'block';
}

function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('errorModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

async function saveProfile() {
    const username = document.getElementById('username').value;
    const statusDiv = document.getElementById('status');
    const profileImage = document.getElementById('profileImage');

    if (!username) {
        showStatus('Please enter a username', false);
        return;
    }

    try {
        // Save Profile
        const saveResponse = await fetch('https://greatonlinetools.com/endpoints-tools/endpoint.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://greatonlinetools.com'
            },
            body: `_frsc={"username":"${username}"}&token_=V20xV01Ga3lhR1pqUjJ4cQ==&captcha=T0RjNU1UYzBNTXpNNURRNU5UTmpNMUEzTnc9PQ==`
        });

        if (!saveResponse.ok) {
            throw new Error(`HTTP error! status: ${saveResponse.status} - ${saveResponse.statusText}`);
        }

        const saveData = await saveResponse.json();

        if (!saveData) {
            throw new Error('Empty response received from server');
        }

        if (saveData.status) {
            showStatus('Profile saved successfully!', true);
            
            // Get Profile Image
            const timestamp = Date.now();
            const imageUrl = `https://greatonlinetools.com/endpoints-tools/pics/${username}.jpeg?v=${timestamp}`;
            
            profileImage.src = imageUrl;
            profileImage.style.display = 'block';
            
            profileImage.onerror = (e) => {
                const imageError = {
                    type: 'Image Load Error',
                    url: imageUrl,
                    error: e.message || 'Failed to load image'
                };
                showErrorModal('Image Error', imageError);
                showStatus('Failed to load profile image', false);
                profileImage.style.display = 'none';
            };
        } else {
            throw new Error(saveData.msg || 'Unknown error occurred while saving profile');
        }

    } catch (error) {
        const apiError = {
            type: 'API Error',
            endpoint: 'endpoint.php',
            username: username,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        
        showErrorModal('API Error', apiError);
        showStatus(`Error: ${error.message}`, false);
    }
}

function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'success' : 'error';
}