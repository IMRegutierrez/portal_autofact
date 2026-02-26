'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/admin-actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-[14px] px-4 border border-transparent rounded-full shadow-sm text-[15px] font-medium text-white bg-[#635Bff] hover:bg-[#524ae6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#635Bff] disabled:opacity-50 transition-colors"
        >
            {pending ? 'Logging in...' : 'Login'}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null);

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
                <div className="bg-white py-12 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[28px] border border-[#f1f2f5]">

                    <div className="text-center mb-10">
                        <h2 className="text-[32px] font-bold text-[#1a1f36]">
                            Admin | Portal de facturación
                        </h2>
                        <p className="mt-2 text-[15px] text-[#6b7280]">
                            Iniciar sesión
                        </p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        {/* 
                            Campo de email removido 
                        */}

                        <div>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none">
                                    <svg className="h-[20px] w-[20px] text-[#9ca3af]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="Password"
                                    className="appearance-none block w-full pl-[46px] pr-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <div className="text-red-500 text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <div className="flex items-center justify-start mt-4 mb-2">
                            <div className="text-[14px]">
                                <a href="#" className="font-medium text-[#635Bff] hover:text-[#524ae6]">
                                    ¿Olvidaste la contraseña?
                                </a>
                            </div>
                        </div>

                        <div>
                            <SubmitButton />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
