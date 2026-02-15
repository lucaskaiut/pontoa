import classNames from 'class-names';
import InputMask from 'react-input-mask';

export const InputPhone = ({ value, onChange, hasError = false }) => {
  const maskBuilder = (value) => {
    if (!value || value.length == 0) {
      return '(99) 99999-9999';
    }
    const mask = format(value);
    return mask.length >= 6 && mask[5] === '9' ? '(99) 99999-9999' : '(99) 9999-9999';
  };

  const format = (value) => {
    const chars = !value ? '' : value.replace(/[^\d]/g, '');
    if (!chars || chars.length < 10) {
      return value;
    }

    const cut = chars.length === 10 ? 6 : 7;
    const max = chars.length > 11 ? 11 : chars.length;
    return `(${chars.substring(0, 2)}) ${chars.substring(2, cut)}-${chars.substring(cut, max)}`;
  };

  return (
    <InputMask
      type="text"
      placeholder="(00) 00000-0000"
      value={value}
      mask={maskBuilder(value)}
      onChange={onChange}
    >
      {(props) => (
        <input
          className={classNames(
            'w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface',
            'focus:outline-hidden focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-400 dark:focus:border-purple-600',
            {
              'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800 focus:border-red-400 dark:focus:border-red-600':
                hasError,
              'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600':
                !hasError,
            },
          )}
          {...props}
        />
      )}
    </InputMask>
  );
};
