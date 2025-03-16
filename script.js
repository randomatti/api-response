// Error handlers
window.onerror = function(msg, url, lineNo, columnNo, error) {
    showErrorModal('JavaScript Error', {
        message: msg,
        location: `${url} (line: ${lineNo}, column: ${columnNo})`,
        stack: error?.stack
    });
    return false;
};

// Console interceptors
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

// Promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    showErrorModal('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
    });
});

// Utility functions
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

    if (!modal || !errorMessage || !errorDetails) {
        console.error('Modal elements not found');
        return;
    }

    errorMessage.innerHTML = `<strong>${title}</strong>`;
    
    let displayError;
    try {
        displayError = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
    } catch (e) {
        displayError = 'Error formatting error message: ' + e.message;
    }

    errorDetails.textContent = displayError;
    modal.style.display = 'block';
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('errorModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Main profile function
async function saveProfile() {
    showLoading();
    const username = document.getElementById('username').value.trim();
    const statusDiv = document.getElementById('status');
    const profileImage = document.getElementById('profileImage');

    if (!username) {
        showStatus('Please enter a username', false);
        hideLoading();
        return;
    }

    try {
        // First try with direct request
        let saveResponse = await fetch('https://greatonlinetools.com/endpoints-tools/endpoint.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Origin': 'https://greatonlinetools.com'
            },
            body: `_frsc={"username":"${username}"}&token_=V20xV01Ga3lhR1pqUjJ4cQ==&captcha=T0RjNU1UYzBNTXpNNURRNU5UTmpNMUEzTnc9PQ==`
        }).catch(async () => {
            // If direct request fails, try with first proxy
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = encodeURIComponent('https://greatonlinetools.com/endpoints-tools/endpoint.php');
            return await fetch(`${proxyUrl}${targetUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: `_frsc={"username":"${username}"}&token_=V20xV01Ga3lhR1pqUjJ4cQ==&captcha=T0RjNU1UYzBNTXpNNURRNU5UTmpNMUEzTnc9PQ==`
            });
        }).catch(async () => {
            // If first proxy fails, try with second proxy
            const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
            return await fetch(`${corsAnywhereUrl}https://greatonlinetools.com/endpoints-tools/endpoint.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Origin': 'https://greatonlinetools.com'
                },
                body: `_frsc={"username":"${username}"}&token_=V20xV01Ga3lhR1pqUjJ4cQ==&captcha=T0RjNU1UYzBNTXpNNURRNU5UTmpNMUEzTnc9PQ==`
            });
        });

        if (!saveResponse.ok) {
            throw new Error(`HTTP error! status: ${saveResponse.status} - ${saveResponse.statusText}`);
        }

        const responseText = await saveResponse.text();
        let saveData;

        try {
            saveData = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`JSON Parse Error: ${parseError.message}. Raw response: ${responseText}`);
        }

        if (!saveData) {
            throw new Error('Empty response received from server');
        }

        if (typeof saveData.status === 'undefined') {
            throw new Error(`Invalid response format. Response: ${JSON.stringify(saveData)}`);
        }

        if (saveData.status === true) {
            showStatus('Profile saved successfully!', true);
            
            const timestamp = Date.now();
            let imageUrl = `https://greatonlinetools.com/endpoints-tools/pics/${username}.jpeg?v=${timestamp}`;
            
            // Try loading image with different methods
            const loadImage = async () => {
                try {
                    // Direct attempt
                    await testImageLoad(imageUrl);
                    return imageUrl;
                } catch {
                    try {
                        // First proxy attempt
                        const proxyUrl = 'https://api.allorigins.win/raw?url=';
                        const proxyImageUrl = `${proxyUrl}${encodeURIComponent(imageUrl)}`;
                        await testImageLoad(proxyImageUrl);
                        return proxyImageUrl;
                    } catch {
                        // Second proxy attempt
                        const corsImageUrl = `https://cors-anywhere.herokuapp.com/${imageUrl}`;
                        await testImageLoad(corsImageUrl);
                        return corsImageUrl;
                    }
                }
            };

            try {
                const workingImageUrl = await loadImage();
                profileImage.onload = () => {
                    profileImage.style.display = 'block';
                };
                profileImage.src = workingImageUrl;
            } catch (imgError) {
                const imageError = {
                    type: 'Image Load Error',
                    url: imageUrl,
                    error: imgError.message || 'Failed to load image with all methods',
                    timestamp: new Date().toISOString()
                };
                showErrorModal('Image Error', imageError);
                showStatus('Failed to load profile image', false);
            }
        } else {
            throw new Error(saveData.msg || 'Unknown error occurred while saving profile');
        }

    } catch (error) {
        const apiError = {
            type: 'API Error',
            endpoint: 'endpoint.php',
            username: username,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            details: {
                name: error.name,
                code: error.code,
                proxyAttempted: true
            }
        };
        
        showErrorModal('API Error', apiError);
        showStatus(`Error: ${error.message}`, false);
    } finally {
        hideLoading();
    }
}

// Helper function to test image loading
function testImageLoad(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });
}

function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = isSuccess ? 'success' : 'error';
    }
}

// Check DOM elements on load
document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = ['errorModal', 'errorMessage', 'errorDetails', 'username', 'status', 'profileImage', 'loading'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
    }
});