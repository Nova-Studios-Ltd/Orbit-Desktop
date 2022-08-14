import { Dictionary } from "./Dictionary";

export default class CommandlineArgs {
    private Arguments: Dictionary<string>;

    constructor (args: string[], prefix: string) {
        this.Arguments = new Dictionary<string>();
        for (let a = 0; a < args.length; a++) {
            const arg = args[a];
            if (arg.startsWith(prefix)) {
                const pair = arg.replace(prefix, "").split("=");
                if (pair.length == 2)
                    this.Arguments.setValue(pair[0], pair[1]);
                else
                    this.Arguments.setValue(pair[0], "");
            }
        }
    }

    hasArgument(key: string) : boolean {
        return this.Arguments.containsKey(key);
    }

    getArgument(key: string) : string | undefined {
        if (this.hasArgument(key)) return undefined;
        return this.Arguments.getValue(key);
    }
}