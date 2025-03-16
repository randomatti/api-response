// Console hata yakalayıcı
window.onerror = function(msg, url, lineNo, columnNo, error) {
    showErrorModal(msg, error);
    return false;
};

// Console log, warn ve error metodlarını yakala
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

console.log = function() {
    showErrorModal('Console Log', Array.from(arguments).join(' '));
    originalConsole.log.apply(console, arguments);
};

console.warn = function() {
    showErrorModal('Console Warning', Array.from(arguments).join(' '));
    originalConsole.warn.apply(console, arguments);
};

console.error = function() {
    showErrorModal('Console Error', Array.from(arguments).join(' '));
    originalConsole.error.apply(console, arguments);
};

// Unhandled promise rejection yakalayıcı
window.addEventListener('unhandledrejection', function(event) {
    showErrorModal('Unhandled Promise Rejection', event.reason);
});

function showErrorModal(title, error) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorDetails = document.getElementById('errorDetails');

    errorMessage.innerHTML = `<strong>${title}</strong>`;
    errorDetails.textContent = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;

    modal.style.display = 'block';
}

function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

// Modal dışına tıklandığında kapatma
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

        const saveData = await saveResponse.json();

        if (saveData.status) {
            showStatus('Profile saved successfully!', true);
            
            // Get Profile Image
            const timestamp = Date.now();
            const imageUrl = `https://greatonlinetools.com/endpoints-tools/pics/${username}.jpeg?v=${timestamp}`;
            
            profileImage.src = imageUrl;
            profileImage.style.display = 'block';
            
            profileImage.onerror = () => {
                showStatus('Failed to load profile image', false);
                profileImage.style.display = 'none';
            };
        } else {
            showStatus('Failed to save profile: ' + saveData.msg, false);
        }

    } catch (error) {
        showStatus('Error: ' + error.message, false);
        showErrorModal('API Error', error);
    }
}

function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'success' : 'error';
}