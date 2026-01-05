import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import FloatLabelField from '@/Components/common/inputs/FloatLabelField';
import EyeIcon from '@/Components/common/icons/EyeIcon';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Atualizar senha
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Use uma senha longa e única para manter sua conta segura.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <FloatLabelField
                        id="current_password"
                        name="current_password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        label="Current Password"
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        error={errors.current_password}
                        isRequired
                        ref={currentPasswordInput}
                        inputProps={{ autoComplete: 'current-password' }}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                title={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                <EyeIcon type={showCurrentPassword ? 1 : 2} />
                            </button>
                        }
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <FloatLabelField
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        label="New Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        isRequired
                        ref={passwordInput}
                        inputProps={{ autoComplete: 'new-password' }}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                <EyeIcon type={showPassword ? 1 : 2} />
                            </button>
                        }
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <FloatLabelField
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        label="Confirm Password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        error={errors.password_confirmation}
                        isRequired
                        inputProps={{ autoComplete: 'new-password' }}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                aria-label={showPasswordConfirmation ? 'Ocultar senha' : 'Mostrar senha'}
                                title={showPasswordConfirmation ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                <EyeIcon type={showPasswordConfirmation ? 1 : 2} />
                            </button>
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Salvo.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
