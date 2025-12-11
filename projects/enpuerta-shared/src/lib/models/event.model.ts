export interface Event {
    eventId: string;
    organizationId: string;
    nameInternal: string;
    aliasPublic: string;
    descriptionShort: string;
    descriptionLong: string;
    eventType: string;
    coverImageUrl: string;
    iconUrl: string;
    locationAddress: string;
    locationMapUrl: string;
    defaultCapacity: number;
    primaryColor: string;
    secondaryColor: string;
    confirmationMessageTemplate: string;
    isSponsored?: boolean;
    sponsoredLevel?: string;
    status: 'active' | 'inactive';
    functionType: 'single' | 'multiple';
    pricingType: 'fixed' | 'pay-what-you-want' | 'free';
    defaultPrice?: number; // Used for 'fixed' pricing
    suggestedPrice?: number; // Used for 'pay-what-you-want' as a suggestion
    bankInfo?: {
        alias: string;
        cbu: string;
        titular: string;
        telefonoComprobantes: string;
    };
}
