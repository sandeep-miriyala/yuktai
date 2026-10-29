export type WebsiteType = "landing" | "ecommerce" | "hotel" | "restaurant" | "portfolio" | "blog" | "saas" | "government" | "healthcare" | "education" | "realestate" | "generic";
export type PageType = "home" | "about" | "contact" | "services" | "pricing" | "blog" | "auth" | "dashboard" | "gallery" | "products" | "cart" | "checkout" | "rooms" | "booking" | "menu" | "reservations" | "portfolio" | "team" | "faq" | "terms" | "privacy";
export type ThemeColour = "blue" | "green" | "purple" | "red" | "orange" | "teal" | "indigo" | "gray";
export interface ParsedRequirement {
    siteName: string;
    websiteType: WebsiteType;
    pages: PageType[];
    features: string[];
    theme: ThemeColour;
    description: string;
}
export declare function parseRequirement(text: string): ParsedRequirement;
