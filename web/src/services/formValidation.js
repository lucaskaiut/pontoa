const rules = {
    required: (data, field) => required(data, field),
    numeric: (data, field) => numeric(data, field),
    date: (data, field) => date(data, field),
    confirmed: (data, field) => confirmed(data, field),
    length: (data, field, size) => length(data, field, size),
    min: (data, field, size) => min(data, field, size),
    max: (data, field, size) => max(data, field, size),
}

function max(data, field, size) {
    return data[field] === undefined || data[field].length <= size;
}

function min(data, field, size) {
    return data[field] === undefined || data[field].length >= size;
}

function length(data, field, size) {
    return data[field] === undefined || data[field].length == size;
}

function required(data, field) {
    return data[field] !== undefined && data[field] !== '';
}

function confirmed(data, field) {
    const fieldConfirmation = `${field}_confirmation`;

    return data[fieldConfirmation] !== undefined && data[fieldConfirmation] !== '' && data[field] === data[fieldConfirmation];
}

function numeric(data, field) {
    return !isNaN(data[field]) && !isNaN(parseFloat(data[field]));
}

function date(data, field) {
    return data[field] === undefined || data[field] instanceof Date;
}

export function validateData(data, validationRules) {
    const validationKeys = Object.keys(validationRules);

    let errors = [];

    let hasError = false;

    for (let key in validationKeys) {
        const fieldRules = validationRules[validationKeys[key]];

        for (let fieldRule in fieldRules) {
            const inputRuleFunction = fieldRules[fieldRule].split(':')[0];
            const ruleFunction = rules[inputRuleFunction];
            const parameter = fieldRules[fieldRule].split(':')[1] ?? null;

            if (!ruleFunction(data, validationKeys[key], parameter)) {
                errors[validationKeys[key]] = true;
                
                hasError = true;
            } else {
                errors[validationKeys[key]] = false;
            }
        }
    }

    hasError = false;

    for (let key in Object.values(errors)) {
        if (Object.values(errors)[key] == true) {
            hasError = true;
        }
    }   

    return {errors, hasError};
}