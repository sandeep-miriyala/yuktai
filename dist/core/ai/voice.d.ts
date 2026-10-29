interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start(): void;
    stop(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognition;
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
export interface VoiceResult {
    success: boolean;
    command: string;
    action: string;
    error?: string;
}
type CommandCallback = (result: VoiceResult) => void;
export declare function checkVoiceSupport(): boolean;
export declare function startVoiceControl(callback?: CommandCallback): boolean;
export declare function stopVoiceControl(): void;
export declare function isVoiceActive(): boolean;
export declare function getVoiceCommands(): {
    phrase: string;
    label: string;
}[];
export {};
