export function bindHandlersToComponent(component: any, methodNamePrefix='handle') {
    const componentMethodNames = Object.getOwnPropertyNames(component.__proto__);
    // filter out the methods with the handler name prefix (default = 'handle'), i.e. handleConfetti
    const handlerMethodNames = componentMethodNames.sort().filter((name, i, arr) => {
        return name !== arr[i + 1] && typeof component[name] == 'function' && name.startsWith(methodNamePrefix);
    });

    // bind handlers to component
    for (const methodName of handlerMethodNames) {
        component[methodName] = component[methodName].bind(component);
    }
}

// return data as object, boolean, number, or string based on type inference here
export function parseDataType(data: any): any {
    try {
        return JSON.parse(data);
    } catch {
        if (data === 'true' || data === 'false') {
            return data === 'true';
        } else if (isNaN(data) || data === '') {
            return data;
        } else {
            return Number(data);
        }
    }
}

export enum CharacterStates {
    IDLE = 0,
    ACTIVE,
    FAILURE,
    SUCCESS
}

export interface GameStateBase {
    feedback: string,
    level: number,
    levelCount: number,
    activity: number,
    activityCount: number,
    character: number
}
