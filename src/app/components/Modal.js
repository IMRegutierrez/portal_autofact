export default function Modal({ message, onClose, isOpen }) {
    if (!isOpen) return null;

    return (
        <div 
            id="messageModal" 
            className="modal-backdrop modal-visible fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={onClose} // Cerrar al hacer clic en el fondo
        >
            <div 
                className="modal-content bg-slate-800 text-slate-200 p-6 md:p-8 rounded-lg shadow-xl text-center max-w-md w-11/12 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalEnter"
                onClick={(e) => e.stopPropagation()} // Evitar que el clic dentro del modal lo cierre
            >
                 <style jsx>{`
                    .animate-modalEnter {
                        animation: modalEnter 0.3s forwards;
                    }
                    @keyframes modalEnter {
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}</style>
                <p id="modalMessageText" className="mb-6 text-lg">{message}</p>
                <button 
                    id="modalCloseButton" 
                    onClick={onClose}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
