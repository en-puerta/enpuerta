import { Pipe, PipeTransform } from '@angular/core';
import { Function } from '@enpuerta/shared';

@Pipe({
    name: 'timeUntilClose',
    standalone: false
})
export class TimeUntilClosePipe implements PipeTransform {
    transform(func: Function): string | null {
        if (!func.dateTime || !func.autoCloseMinutesBefore) {
            return null;
        }

        const functionTime = func.dateTime instanceof Date
            ? func.dateTime
            : (func.dateTime as any).toDate();

        const closeTime = new Date(functionTime.getTime() - (func.autoCloseMinutesBefore * 60 * 1000));
        const now = new Date();
        const minutesUntilClose = Math.floor((closeTime.getTime() - now.getTime()) / (60 * 1000));

        // Only show if less than 60 minutes and not yet closed
        if (minutesUntilClose > 60 || minutesUntilClose < 0) {
            return null;
        }

        if (minutesUntilClose === 0) {
            return 'Cierra en menos de 1 minuto';
        } else if (minutesUntilClose === 1) {
            return 'Cierra en 1 minuto';
        } else {
            return `Cierra en ${minutesUntilClose} minutos`;
        }
    }
}
