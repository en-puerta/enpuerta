import { Injectable } from '@angular/core';

declare global {
    interface Window {
        google: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    constructor() { }

    /**
     * Initialize Google Places Autocomplete on an input element using new Places API
     * @param inputElement - The HTML input element
     * @param onPlaceSelected - Callback when a place is selected
     */
    initAutocomplete(
        inputElement: HTMLInputElement,
        onPlaceSelected: (place: any) => void
    ): void {
        // Wait for Google Maps API to load
        if (typeof window.google === 'undefined' || !window.google.maps) {
            console.warn('Google Maps API not loaded yet. Autocomplete will not work.');
            return;
        }

        try {
            // Create autocomplete instance with new API
            const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                types: ['geocode', 'establishment'],
                fields: ['formatted_address', 'geometry', 'name', 'address_components'],
                componentRestrictions: { country: 'ar' } // Restrict to Argentina
            });

            // Listen for place selection
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (!place.geometry) {
                    console.warn('No geometry found for selected place');
                    return;
                }

                onPlaceSelected(place);
            });

        } catch (error) {
            console.error('Error initializing Google Places Autocomplete:', error);
        }
    }

    /**
     * Extract formatted address from place object
     */
    getFormattedAddress(place: any): string {
        return place.formatted_address || place.name || '';
    }

    /**
     * Extract coordinates from place object
     */
    getCoordinates(place: any): { lat: number, lng: number } | null {
        if (place.geometry && place.geometry.location) {
            return {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
        }
        return null;
    }
}
