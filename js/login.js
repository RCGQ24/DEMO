// Funcionalidad de la pantalla de login
class LoginScreen {
    constructor() {
        this.form = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredCredentials();
    }

    setupEventListeners() {
        // Manejar envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Validación en tiempo real
        this.usernameInput.addEventListener('input', () => {
            this.validateField(this.usernameInput);
        });

        this.passwordInput.addEventListener('input', () => {
            this.validateField(this.passwordInput);
        });

        // Escuchar cambios de pantalla
        document.addEventListener('screenChanged', (e) => {
            if (e.detail.screenId === 'login-screen') {
                this.onScreenShow();
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remover clases de error previas
        field.classList.remove('error');
        this.removeErrorMessage(field);

        // Validaciones específicas
        if (field === this.usernameInput) {
            if (value.length < 3) {
                isValid = false;
                errorMessage = 'El usuario debe tener al menos 3 caracteres';
            }
        } else if (field === this.passwordInput) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            }
        }

        // Aplicar validación
        if (!isValid) {
            field.classList.add('error');
            this.showErrorMessage(field, errorMessage);
        }

        return isValid;
    }

    showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    validateForm() {
        const isUsernameValid = this.validateField(this.usernameInput);
        const isPasswordValid = this.validateField(this.passwordInput);
        
        return isUsernameValid && isPasswordValid;
    }

    async handleLogin() {
        if (!this.validateForm()) {
            utils.showNotification('Por favor, corrija los errores en el formulario', 'error');
            return;
        }

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        // Mostrar indicador de carga
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        try {
            // Simular llamada a API
            await this.simulateApiCall(username, password);
            
            // Guardar credenciales (en una app real, esto sería un token)
            this.saveCredentials(username);
            
            // Mostrar mensaje de éxito
            utils.showNotification('Inicio de sesión exitoso', 'success');
            
            // Navegar a la siguiente pantalla
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('navigateTo', {
                    detail: {
                        screen: 'area-selection-screen',
                        data: {
                            'login-screen': { username }
                        }
                    }
                }));
            }, 1000);

        } catch (error) {
            utils.showNotification(error.message, 'error');
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateApiCall(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular validación de credenciales
                if (username === 'Augusto.fragiel' && password === 'Sistema2025') {
                    resolve({ success: true, user: { username, role: 'admin' } });
                } else if (username === 'user' && password === '123456') {
                    resolve({ success: true, user: { username, role: 'user' } });
                } else {
                    reject(new Error('Usuario o contraseña incorrectos'));
                }
            }, 1500);
        });
    }

    saveCredentials(username) {
        // En una aplicación real, aquí se guardaría un token JWT
        localStorage.setItem('currentUser', username);
    }

    loadStoredCredentials() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.usernameInput.value = storedUser;
        }
    }

    onScreenShow() {
        // Limpiar formulario cuando se muestra la pantalla
        this.passwordInput.value = '';
        this.usernameInput.focus();
        
        // Remover errores previos
        this.usernameInput.classList.remove('error');
        this.passwordInput.classList.remove('error');
        this.removeErrorMessage(this.usernameInput);
        this.removeErrorMessage(this.passwordInput);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginScreen();
});
