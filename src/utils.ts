export const setValue = (obj: Record<string, any>, key: string, value: any): void => {
    const keys: string[] = key.split('.');
    const lastKey: string = keys.pop()!;

    if (keys.length === 0) {
        obj[lastKey] = value;
        return;
    }

    keys.reduce((acc: Record<string, any>, k: string) => acc[k] = acc[k] || {}, obj)[lastKey] = value;
};

export const fixNaming = (key: string): string => key.replace("-", "");