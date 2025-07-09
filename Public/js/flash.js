// JS centralizado para flash messages
(function() {
    // Auto-remove flash messages após 5 segundos
    setTimeout(function() {
        const flashMessages = document.querySelectorAll('.flash-message');
        flashMessages.forEach(function(message) {
            message.style.opacity = '0';
            setTimeout(function() {
                message.remove();
            }, 300);
        });
    }, 5000);

    // Fechar manualmente
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.flash-message .close').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.parentElement.remove();
            });
        });
    });
})(); 