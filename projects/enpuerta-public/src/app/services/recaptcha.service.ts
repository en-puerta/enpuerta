import { Injectable } from '@angular/core';

declare const grecaptcha: any;

@Injectable({
    providedIn: 'root'
})
export class RecaptchaService {
    private siteKey = '6LdCwyssAAAAAIm3iWvhEVrtCHNpuMSB75bXhY4a';

    constructor() { }

    /**
     * Execute reCAPTCHA v3 and get token
     * @param action Action name for analytics (e.g., 'booking', 'login')
     * @returns Promise with reCAPTCHA token
     */
    async execute(action: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (typeof grecaptcha === 'undefined') {
                reject('reCAPTCHA not loaded');
                return;
            }

            grecaptcha.ready(() => {
                grecaptcha.execute(this.siteKey, { action })
                    .then((token: string) => resolve(token))
                    .catch((error: any) => reject(error));
            });
        });
    }
}
