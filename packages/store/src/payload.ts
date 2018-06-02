const action: ActionInformation = {} as ActionInformation;

interface ActionInformation {
  name: string;
  type: string;
}

interface ArgsForCheckObjectProps {
  original: any;
  payload: any;
  propName?: string;
}

interface ArgsForCheckArrayProps {
  original: any | any[];
  propName: string;
}

/**
 * Decorator for runtime checking keys and values types
 */
export function Payload(ActionType): any {
  const instance = new ActionType();
  action.name = ActionType.name;

  return (target: any): any => {
    const original = target;
    action.type = original.type;

    function construct(constructor, args): ClassDecorator {
      const payload = args[0];

      const isPrimitiveType = action.name === 'Number' || action.name === 'String' || action.name === 'Boolean';
      if (isPrimitiveType && typeof payload !== action.name.toLowerCase()) {
        throw new Error(
          `'${original.type}' must be typeof '${action.name}'! \n Dispatched type of '${typeof payload}' is unexpected.`
        );
      }

      Object.entries(instance).forEach(
        checkPayloadPropObject({
          original: instance,
          payload
        })
      );

      const c: any = function(): any {
        return constructor.apply(this, args);
      };

      c.prototype = constructor.prototype;

      return new c();
    }

    const f: any = function(...args): any {
      return construct(original, args);
    };

    f.type = original.type;
    f.prototype = original.prototype;

    return f;
  };
}

/**
 * Function expression that checks array properties
 * @ignore
 */
const checkPayloadPropArray: any = ({ original, propName }: ArgsForCheckArrayProps) => {
  return (payloadValue: any | any[]): void => {
    if (Array.isArray(original) && Array.isArray(payloadValue)) {
      payloadValue.forEach(
        checkPayloadPropArray({
          original,
          propName
        })
      );
    } else if (Array.isArray(original) && !Array.isArray(payloadValue)) {
      if (typeof original[0] !== typeof payloadValue) {
        throw new Error(`Property '${propName}' expects nested array typeof ${typeof original[0]}`);
      }
    } else if (!Array.isArray(original) && Array.isArray(payloadValue)) {
      throw new Error(`Property '${propName}' expects nested object`);
    } else {
      Object.entries(original).forEach(
        checkPayloadPropObject({
          original,
          payload: payloadValue,
          propName
        })
      );
    }
  };
};

/**
 * Function expression that checks object properties
 * @ignore
 */
const checkPayloadPropObject: any = ({ original, payload, propName }: ArgsForCheckObjectProps): any => {
  return ([property, value]: [string, any]): void => {
    if (!(property in original)) {
      throw new Error(`'${action.name}' must be typeof '${action.type}'. Property '${property}' is absent`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(
        checkPayloadPropObject({
          original: original[property],
          payload: payload[property],
          propName
        })
      );
    } else if (Array.isArray(value) && !Array.isArray(payload[property])) {
      throw Error(`Property '${property}' expects an array instead ${typeof payload[property]}`);
    } else if (Array.isArray(value) && Array.isArray(payload[property])) {
      if (value.length === 0) {
        return;
      }

      const type = typeof value[0];
      const incorrectArrayValue = payload[property].find((arrayValue: any) => typeof arrayValue !== type);

      if (incorrectArrayValue) {
        throw Error(`Property '${property}' expects an array of ${type}s`);
      } else if (type === 'object') {
        payload[property].forEach(
          checkPayloadPropArray({
            original: value[0],
            propName: property
          })
        );
      }
    } else if (typeof value !== typeof payload[property]) {
      throw Error(`${action.name}'s property '${property}' expects a value typeof ${typeof value}`);
    }
  };
};
