import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        maxLength,
        onChange,
        ...props
    },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleChange = (event) => {
        if (typeof maxLength === 'number' && maxLength > 0) {
            if (event.target.value && event.target.value.length > maxLength) {
                event.target.value = event.target.value.slice(0, maxLength);
            }
        }

        if (onChange) {
            onChange(event);
        }
    };

    return (
        <input
            {...props}
            type={type}
            maxLength={maxLength}
            onChange={handleChange}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
