import classNames from "classnames";
import InputMask from 'react-input-mask';

export const Input = (props) => {
    const {type, placeholder, onChange, value, mask, label, hideLabel} = props;
    
    const normalizeValue = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' || typeof val === 'number') return String(val);
        if (typeof val === 'object') {
            try {
                return JSON.stringify(val);
            } catch {
                return String(val);
            }
        }
        return String(val);
    };
    
    const normalizedValue = normalizeValue(value);
    const normalizedLabel = normalizeValue(label || placeholder);
    const normalizedPlaceholder = normalizeValue(placeholder);
    
    return (
        <>
            {!hideLabel && (
                <label htmlFor="input" className="block mb-1 text-gray-700 dark:text-dark-text">{normalizedLabel}</label>
            )}
            <InputMask 
                className={classNames("w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-400 dark:focus:border-purple-600", {
                    "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600": true,
                })}
                type={type}
                placeholder={normalizedPlaceholder}
                onChange={onChange}
                value={normalizedValue}
                mask={mask}
                id="input"
                {...props}
            />
        </>
    );
}