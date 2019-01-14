import Tools from "./tools";

export default class Assembly {
    // Public members
    public static Instance: WebAssembly.Instance = null;
    public static Module: WebAssembly.Module = null;

    /**
     * Inits the assembly tools
     */
    public static async Init (): Promise<void> {
        const buffer = await Tools.LoadFile<ArrayBuffer>('./build/assembly/optimized.wasm', true);
        if (!WebAssembly.validate(buffer))
            return;

        const memory = new WebAssembly.Memory({ initial: 2 });
        this.Module = new WebAssembly.Module(buffer);
        this.Instance = new WebAssembly.Instance(this.Module, {
            imports: {
                memory: memory
            },
            env: {
                abort(msg, file, line, column) {
                    console.error(`abort called at ${file}: ${line}: ${column}`);
                    console.error(msg);
                }
            }
        });
    }

    /**
     * Calls a method on 
     */
    public static Call<T> (method: string, ...args: any[]): T {
        return <T> this.Instance.exports[method].apply({ }, args);
    }
}
