import DangerButton from '@/Components/common/buttons/DangerButton';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/common/buttons/SecondaryButton';
import FloatLabelField from '@/Components/common/inputs/FloatLabelField';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Modal from '@/Components/common/Modal';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Excluir conta
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Ao excluir sua conta, todos os seus dados serão apagados
                    permanentemente. Faça download de qualquer informação que
                    deseja guardar antes de continuar.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Excluir conta
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Tem certeza de que deseja excluir sua conta?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Depois de excluir a conta, todos os recursos e dados
                        serão apagados permanentemente. Digite sua senha para
                        confirmar essa ação.
                    </p>

                    <div className="mt-6 w-3/4">
                        <FloatLabelField
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                            isRequired
                            inputProps={{ autoFocus: true }}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancelar
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Excluir conta
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
