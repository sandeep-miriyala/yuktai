export interface Plugin {
    name: string;
    execute(input: any): any | Promise<any>;
}
export declare class Runtime {
    private plugins;
    register(name: string, plugin: Plugin): void;
    /**
     * 🔹 Direct Plugin Access
     * This is what YuktAI.use(name) calls.
     */
    use(name: string): Plugin | undefined;
    /**
     * 🔹 Run task
     */
    run(task: string, input: unknown): Promise<unknown>;
    getPlugins(): string[];
}
