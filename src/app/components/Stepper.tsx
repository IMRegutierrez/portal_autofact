'use client';

export interface Step {
    title: string;
    subtitle?: string;
}

interface StepperProps {
    steps: Step[];
    current: number; // 1-based
    accent: string;
}

export default function Stepper({ steps, current, accent }: StepperProps) {
    const N = steps.length;
    const trackLen = N > 1 ? 100 - 100 / N : 0; // ancho del riel en %
    const fillW = N > 1 ? (trackLen * (current - 1)) / (N - 1) : 0;

    return (
        <div className="relative w-full select-none pt-1 pb-2">
            {/* Riel base */}
            <div
                className="absolute h-[3px] rounded-full bg-gray-200"
                style={{ top: '15px', left: `${50 / N}%`, width: `${trackLen}%` }}
            />
            {/* Riel de progreso */}
            <div
                className="absolute h-[3px] rounded-full transition-all duration-500 ease-out"
                style={{ top: '15px', left: `${50 / N}%`, width: `${fillW}%`, backgroundColor: accent }}
            />

            <div className="relative flex">
                {steps.map((step, i) => {
                    const index = i + 1;
                    const isDone = index < current;
                    const isActive = index === current;
                    const reached = isDone || isActive;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-semibold z-10 transition-all duration-300"
                                style={
                                    reached
                                        ? { backgroundColor: accent, color: '#ffffff', boxShadow: isActive ? `0 0 0 4px ${accent}26` : 'none' }
                                        : { backgroundColor: '#ffffff', color: '#94a3b8', border: '2px solid #e2e8f0' }
                                }
                            >
                                {isDone ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index
                                )}
                            </div>
                            <div className="mt-2 text-center px-1">
                                <div
                                    className="text-xs sm:text-sm font-semibold leading-tight transition-colors"
                                    style={{ color: isActive ? accent : isDone ? '#334155' : '#94a3b8' }}
                                >
                                    {step.title}
                                </div>
                                {step.subtitle && (
                                    <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">
                                        {step.subtitle}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
