export default function Loader({ message = "Procesando..."}) {
    return (
        <div className="flex flex-col items-center justify-center text-slate-400 my-8">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-500 h-12 w-12 mb-4" style={{ borderTopColor: '#3498db' }}></div>
            <p>{message}</p>
        </div>
    );
}
