// --- Se añaden las nuevas props: showReportButton y onReportProblem ---
interface ModalProps {
    message: string;
    onClose: () => void;
    isOpen: boolean;
    showReportButton?: boolean;
    onReportProblem?: () => void;
    isReporting?: boolean;
}

export default function Modal({ message, onClose, isOpen, showReportButton, onReportProblem, isReporting }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 text-slate-200 p-6 md:p-8 rounded-lg shadow-xl text-center max-w-md w-11/12"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="mb-6 text-lg">{message}</p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                    {/* --- Se muestra el nuevo botón si showReportButton es true --- */}
                    {showReportButton && (
                        <button
                            onClick={onReportProblem}
                            disabled={isReporting}
                            className={`font-semibold py-2 px-6 rounded-lg transition-colors ${isReporting ? 'bg-yellow-700 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        >
                            {isReporting ? 'Enviando...' : 'Reportar Problema'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
