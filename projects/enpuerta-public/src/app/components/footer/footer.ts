import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: false,
    templateUrl: './footer.html',
    styleUrl: './footer.scss',
})
export class FooterComponent {
    email = '';
    subscribed = false;
    subscribeMessage = '';
    subscribeError = false;
    currentYear = new Date().getFullYear();

    onSubscribe(): void {
        if (!this.email || !this.email.includes('@')) {
            this.subscribeError = true;
            this.subscribeMessage = 'Por favor ingresá un email válido';
            return;
        }

        // TODO: Implement actual newsletter subscription (e.g., Mailchimp, SendGrid)
        // For now, just show success message
        this.subscribed = true;
        this.subscribeError = false;
        this.subscribeMessage = '¡Gracias! Te mantendremos informado.';

        // Reset after 3 seconds
        setTimeout(() => {
            this.subscribeMessage = '';
        }, 3000);
    }
}
