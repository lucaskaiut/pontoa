export const PlanCard = ({ id, name, amount, label, freeTesting, onSelectPlan }) => {
    return (
            <div className="rounded-xl w-1/3 flex flex-col items-center py-4 px-2 bg-primary">
                <h2 className="text-xl font-thin">
                    {name}
                </h2>
                <p className="text-6xl mt-6">
                    <small className="text-lg self-start">R$</small>
                    {amount}
                </p>
                <p className="mt-6">
                    {label}
                </p>
                <small>{freeTesting}</small>

                <button 
                    className="w-full bg-white text-zinc-900 hover:scale-110 transition-all border border-primary py-4 rounded-lg mt-10"
                    onClick={() => onSelectPlan(id)}
                >
                    Compre agora
                </button>
            </div>
    );
}